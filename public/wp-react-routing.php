<?php
/**
 * WordPress Integration Helper for ITAP React SPA
 * 
 * If you are hosting or embedding this React application inside a WordPress site:
 * 
 * METHOD 1: Static Folder Upload (Recommended)
 * 1. Build the app: `npm run build`
 * 2. Upload the contents of the `dist/` directory to a folder on your server 
 *    (e.g., `/public_html/wordpress/` or `/public_html/` or a custom subfolder).
 * 3. The included `.htaccess` file automatically rewrites all SPA routes (/events, /membership, etc.) 
 *    to `index.html` without conflicting with WordPress!
 * 
 * METHOD 2: Custom WordPress Rewrite in functions.php
 * If you need WordPress to serve the React app while preserving WordPress headers/database:
 * Add the following code to your theme's functions.php or a custom plugin.
 */

// 1. Register SPA rewrite rules
add_action('init', function() {
    add_rewrite_rule('^wordpress/(.*)?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^events/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^membership/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techxsummit2026/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-summit-2026/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-rsvp/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-registration/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-qa/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-qa-host/?$', 'index.php?itap_app=1', 'top');
    add_rewrite_rule('^techx-live-qa/?$', 'index.php?itap_app=1', 'top');
});

// 2. Allow query var
add_filter('query_vars', function($vars) {
    $vars[] = 'itap_app';
    return $vars;
});

// 3. Serve the React index.html when matched
add_action('template_redirect', function() {
    if (get_query_var('itap_app')) {
        $spa_file = WP_CONTENT_DIR . '/uploads/itap/index.html'; // adjust path to where dist is placed
        if (file_exists($spa_file)) {
            header('HTTP/1.1 200 OK');
            header('Content-Type: text/html; charset=utf-8');
            readfile($spa_file);
            exit;
        }
    }
});
