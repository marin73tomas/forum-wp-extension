<?php

if (!class_exists('FWE_Builder') || !class_exists('fmwp\ajax\Topic')) {

     class FWE_Builder
     {
          public function __construct()
          {
               $this->actions();
               $this->filters();
               $this->functions = new FWE_Functions();
          }

          function actions()
          {
               add_action('wp_footer', array($this, 'add_popup_actions'));
               add_action('wp_enqueue_scripts', array($this, 'scripts'), 999);
               add_action('wp_enqueue_scripts', array($this, 'styles'));
               //add_action('fmwp_topic_footer', array($this, 'add_files_to_footer'));
               add_action('rest_api_init', array($this, 'rest_routes'));
          }

          function filters()
          {
               add_filter('fmwp_create_topic_args', array($this, 'fwe_files_filter'));
               add_filter('fmwp_edit_topic_args', array($this, 'fwe_files_filter_edit'));
               add_filter('fmwp_create_reply_args', array($this, 'fwe_files_filter_edit'));
               add_filter('fmwp_edit_reply_args', array($this, 'fwe_files_filter_edit'));
          }
          function scripts()
          {
               if (!wp_script_is('suggest')) {
                    wp_enqueue_script('suggest');
               }
               wp_deregister_script("fmwp-topic-popup");
               wp_dequeue_script("fmwp-topic-popup");

               wp_enqueue_script('fmwp-popup',  plugin_dir_url(__FILE__) . '/js/popup.min.js');
               wp_enqueue_script('fmwp-topic-popup',  plugin_dir_url(__FILE__) . '/js/topic-popup-custom.js');
               // wp_enqueue_script('fwe-multifiles',  plugin_dir_url(__FILE__) . '/js/jquery.MultiFile.min.js');
               wp_enqueue_script('fwe-script',  plugin_dir_url(__FILE__) . '/js/extension.js');
               wp_localize_script(
                    'fmwp-topic-popup',
                    'ajaxvars',
                    array(
                         'ajaxurl' => admin_url('admin-ajax.php'),
                         'nonce' => wp_create_nonce('fmwp-create-topic')
                    )
               );
               wp_localize_script('fwe-script', 'fwevars', array('topic_popup_url' => plugin_dir_url(__FILE__) . '/js/topic-popup-custom.js'));

               wp_deregister_script("fmwp-reply-popup");
               wp_dequeue_script("fmwp-reply-popup");
               wp_register_script('fmwp-reply-popup', plugin_dir_url(__FILE__) . '/js/custom-reply-popup.js',  ['fmwp-front-global', 'fmwp-popup-general', 'jquery-ui-autocomplete'], time(), true);
          }
          function styles()
          {
               wp_enqueue_style('fwe-styles',  plugin_dir_url(__FILE__) . '/css/styles.css', [], time());
          }
          function add_popup_actions()
          {
?>

               <div class="fwe-extension mce-widget mce-btn mce-last">
                    <a>Upload Files</a>

                    <div class="modal micromodal-slide" id="modal-1" aria-hidden="true">
                         <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                              <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                                   <header class="modal__header">
                                        <h2 class="modal__title" id="modal-1-title">
                                             Upload Files
                                        </h2>
                                        <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                                   </header>
                                   <main class="modal__content" id="modal-1-content">
                                        <div class="fwe-extension-modal">
                                             <div class="drop-area">
                                                  <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
                                                  <input type="file" id="fileElem" multiple onchange="handleFiles(this, this.files)">
                                                  <label class="button" for="fileElem">Select some files</label>
                                             </div>
                                             <div class="gallery"></div>
                                        </div>
                                   </main>
                              </div>
                         </div>
                    </div>

               </div>
               <script defer async src="https://unpkg.com/micromodal/dist/micromodal.min.js"></script>
               <?php
          }


          function rest_routes()
          {
               register_rest_route('fwe/v1', '/files/(?P<id>\d+)', array(
                    'methods' => 'GET',
                    'callback' => array($this, 'callback_rest_route_for_post_meta'),
                    'permission_callback' => function () {
                         return true;
                    }
               ));
               register_rest_route('fwe/v1', '/frontend/(?P<id>\d+)', array(
                    'methods' => 'GET',
                    'callback' => array($this, 'callback_rest_route_for_frontend_files'),
                    'permission_callback' => function () {
                         return true;
                    }
               ));
          }

          function callback_rest_route_for_post_meta($data)
          {
               $post_id = sanitize_text_field($data['id']);
               $files = get_post_meta($post_id, 'uploaded_files', true);
               return $files;
          }

          function callback_rest_route_for_frontend_files($data)
          {
               $post_id = sanitize_text_field($data['id']);
               $files = get_post_meta($post_id, 'uploaded_files');
               if (!empty($files)) {
                    $files = $files[0];
                    if (!empty($files)) {
               ?>
                         <div class="fwe-files">

                              <p>Attachment files:</p>
                              <?php

                              foreach ($files as $file) {
                                   $name = $file['name'];
                                   $url = $file['url'];
                                   $type = $file['type'];
                                   if (strstr($type, "image")) {
                              ?>
                                        <a class="fwe-file" download="<?php echo $name; ?>" target="_blank" href="<?php echo esc_url($url); ?>">

                                             <img src=" <?php echo esc_url($url); ?>" alt="<?php echo wp_basename($url); ?>"></a>
                                   <?php
                                   } else {
                                        $icon_class = $this->functions->get_file_icon($type);

                                   ?>
                                        <a download="<?php echo $name; ?>" class="fwe-file" target="_blank" href="<?php echo esc_url($url); ?>"><i class="<?php echo $icon_class; ?>"></i> </a>

                              <?php
                                   }
                              }
                              ?>
                         </div>
               <?php
                    }
               }

               ?>


<?php
          }
          function ContentUrlToLocalPath($url)
          {
               preg_match('/.*(wp\-content\/uploads\/\d+\/\d+\/.*)/', $url, $mat);
               if (count($mat) > 0) return ABSPATH . $mat[1];
               return '';
          }
          function fwe_files_filter_edit($args)
          {
               return $this->fwe_files_filter($args, true);
          }
          function fwe_files_filter($args, $is_edit = false)
          {

               // for multiple file upload.
               $upload_overrides = array('test_form' => false, 'mimes' => FWE_ALLOWED_MIMES);
               $files = $_FILES['files'];
               $files_array = [];
               $user_id = get_current_user_id();
               $last_uploaded_files = get_post_meta($args['ID'], 'uploaded_files', true);
               foreach ((array) $files['name'] as $key => $value) {
                    if ($files['name'][$key]) {
                         $filen_name = $files['name'][$key];
                         $file_info = wp_check_filetype(basename($files['name'][$key]));
                         if (empty($file_info['ext'])) {
                              // This file is valid
                              wp_send_json_error(__("This file is {$filen_name} valid", 'forumwp'));
                         }
                         $file = array(
                              'name' =>  $user_id  . $args['ID'] . sanitize_file_name($files['name'][$key]),
                              'type' => $files['type'][$key],
                              'tmp_name' => $files['tmp_name'][$key],
                              'error' => $files['error'][$key],
                              'size' => $files['size'][$key]
                         );

                         $movefile = wp_handle_upload($file, $upload_overrides);
                         if ($movefile && !isset($movefile['error'])) {

                              $files_array[] = [
                                   'name' => $files['name'][$key],
                                   'url' => $movefile['url'],
                                   'size' => $files['size'][$key],
                                   'type' => wp_check_filetype($movefile['url'])['type'],
                                   'accepted' => true,
                                   'userID' => get_current_user_id(),
                              ];
                         }
                    }
               }


               if ($is_edit == true && !empty($last_uploaded_files)) {
                    $to_delete = json_decode(stripslashes($_POST['toDelete']));

                    if (!empty($to_delete)) {

                         foreach ($last_uploaded_files as $key => $lf) {
                              foreach ($to_delete as $df) {

                                   if ($lf['url'] == $df->url && ($lf['userID'] == $user_id || current_user_can('administrator'))) {

                                        unset($last_uploaded_files[$key]);
                                        wp_delete_file($this->ContentUrlToLocalPath($lf['url']));

                                        break;
                                   }
                              }
                         }
                    }
                    $data = array_merge($files_array, $last_uploaded_files);

                    $allurl = array_map(function ($v) {
                         return $v['url'];
                    }, $data);

                    $uniqueurl = array_unique($allurl);

                    $result = array_intersect_key($data, $uniqueurl);

                    $args['meta_input']['uploaded_files'] = $result;
                    return  $args;
               }

               $args['meta_input']['uploaded_files'] = $files_array;

               return $args;
          }
     }
     new FWE_Builder();
} else {
     throw new Exception('Error. The plugin could not have been inicialized.');
}
