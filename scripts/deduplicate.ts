import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json' with { type: 'json' };

function normalizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeMobile(phone: string | undefined | null): string {
  if (!phone) return '';
  // Extract all digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    // Return last 10 digits (e.g. 9171234567)
    return digits.slice(-10);
  }
  return digits;
}

export async function runDeduplication(dryRun: boolean = true) {
  console.log(`\n=== Running TechX & GMM Registration Deduplication (dryRun=${dryRun}) ===`);
  const app = initializeApp(appletConfig);
  const db = initializeFirestore(app, {}, appletConfig.firestoreDatabaseId);

  const colRef = collection(db, 'techx_registrations');
  const snap = await getDocs(colRef);
  console.log(`Fetched ${snap.size} total registration documents from Firestore.`);

  const allRecords: any[] = [];
  snap.forEach((d) => {
    allRecords.push({ id: d.id, ...d.data() });
  });

  // Sort by createdAt ascending (earliest first so we preserve the original registration)
  allRecords.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const keptStudents: any[] = [];
  const keptIndustry: any[] = [];
  const duplicatesToDelete: { id: string; reason: string; keptId: string; type: string; info: string }[] = [];

  for (const record of allRecords) {
    const isStudent = record.attendeeType === 'student' || 
                      (!record.attendeeType && (record.studentNumber || record.college || record.id?.startsWith('TIP-TX-')));
    
    const email = normalizeText(record.email || record.workEmail);
    const fullName = normalizeText(record.fullName || `${record.firstName || ''} ${record.lastName || ''}`);
    const mobile = normalizeMobile(record.mobile || record.mobileNumber || record.phone);
    const studentNum = normalizeText(record.studentNumber);
    const company = normalizeText(record.companyName || record.company || record.organization);

    if (isStudent) {
      // Check against already kept students
      const match = keptStudents.find((existing) => {
        const existEmail = normalizeText(existing.email || existing.workEmail);
        const existFullName = normalizeText(existing.fullName || `${existing.firstName || ''} ${existing.lastName || ''}`);
        const existMobile = normalizeMobile(existing.mobile || existing.mobileNumber || existing.phone);
        const existStudentNum = normalizeText(existing.studentNumber);

        // Match condition 1: Same valid email
        if (email && existEmail && email !== 'n/a' && existEmail !== 'n/a' && email === existEmail) {
          return true;
        }
        // Match condition 2: Same student ID number
        if (studentNum && existStudentNum && studentNum !== 'n/a' && studentNum === existStudentNum) {
          return true;
        }
        // Match condition 3: Same full name and same phone number
        if (fullName && existFullName && fullName === existFullName && mobile && existMobile && mobile === existMobile) {
          return true;
        }
        return false;
      });

      if (match) {
        duplicatesToDelete.push({
          id: record.id,
          reason: `Duplicate Student (${email || fullName || mobile})`,
          keptId: match.id,
          type: 'student',
          info: `${record.fullName} <${record.email}> [${record.mobile}]`
        });
      } else {
        keptStudents.push(record);
      }
    } else {
      // Industry / GMM RSVP
      const match = keptIndustry.find((existing) => {
        const existEmail = normalizeText(existing.email || existing.workEmail);
        const existFullName = normalizeText(existing.fullName || existing.name);
        const existCompany = normalizeText(existing.companyName || existing.company || existing.organization);
        const existMobile = normalizeMobile(existing.mobile || existing.mobileNumber || existing.phone);

        // Match condition 1: Same valid email
        if (email && existEmail && email !== 'n/a' && existEmail !== 'n/a' && email === existEmail) {
          return true;
        }
        // Match condition 2: Same full name and company
        if (fullName && existFullName && fullName === existFullName && company && existCompany && company === existCompany) {
          return true;
        }
        // Match condition 3: Same full name and mobile
        if (fullName && existFullName && fullName === existFullName && mobile && existMobile && mobile === existMobile) {
          return true;
        }
        return false;
      });

      if (match) {
        duplicatesToDelete.push({
          id: record.id,
          reason: `Duplicate GMM RSVP (${email || fullName || company})`,
          keptId: match.id,
          type: 'industry',
          info: `${record.fullName} (${record.companyName || record.company}) <${record.email}>`
        });
      } else {
        keptIndustry.push(record);
      }
    }
  }

  console.log(`\nIdentified ${duplicatesToDelete.length} duplicates to remove:`);
  console.log(`Kept Students: ${keptStudents.length}, Kept Industry/GMM: ${keptIndustry.length}`);

  duplicatesToDelete.forEach((dup, i) => {
    console.log(`[${i + 1}] Remove doc: ${dup.id} | Kept: ${dup.keptId} | ${dup.reason} | ${dup.info}`);
  });

  if (!dryRun) {
    console.log(`\nExecuting deletion of ${duplicatesToDelete.length} duplicate documents from Firestore...`);
    let deletedCount = 0;
    for (const dup of duplicatesToDelete) {
      try {
        await deleteDoc(doc(db, 'techx_registrations', dup.id));
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete doc ${dup.id}:`, err);
      }
    }
    console.log(`Successfully deleted ${deletedCount}/${duplicatesToDelete.length} duplicate documents from Firestore.`);
  }

  return {
    totalBefore: snap.size,
    duplicatesCount: duplicatesToDelete.length,
    studentsKept: keptStudents.length,
    industryKept: keptIndustry.length,
    duplicatesToDelete
  };
}

// If run directly
if (process.argv[1]?.includes('deduplicate.ts')) {
  const isCommit = process.argv.includes('--commit');
  runDeduplication(!isCommit)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
