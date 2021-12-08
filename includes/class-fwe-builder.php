<?php

if (!class_exists('FWE_Builder') || !class_exists('fmwp\ajax\Topic')) {

     class FWE_Builder
     {
          // const ALLOWED_MIMES =
          // array(
          //      'jpg|jpeg|jpe' => 'image/jpeg',
          //      'gif'          => 'image/gif',
          //      'png'          => 'image/png',

          // );
          
          // ['jpg','jpeg',
          // 'png','gif','pdf','doc','docx','xls','xlsx','xlsx',
          // 'ppt', 'pptx', '']


          public function __construct()
          {
               $this->actions();
               $this->filters();
          }

          function actions()
          {
               add_action('fmwp_topic_popup_actions', array($this, 'add_popup_actions'));
               add_action('wp_enqueue_scripts', array($this, 'scripts'), 999);
               add_action('fmwp_topic_footer', array($this, 'add_template_actions'));
          }
          function filters()
          {
               add_filter('fmwp_ajax_create_topic_args', array($this, 'create_filter'));
               add_filter('fmwp_create_topic_args', array($this, 'create_filter'));
               // add_filter('fmwp_ajax_edit_topic_args', array($this, 'edit_filter'));

               // add_filter('fmwp_edit_topic_args', array($this, 'edit_filter'));
          }
          function scripts()
          {
               wp_deregister_script("fmwp-topic-popup");
               wp_dequeue_script("fmwp-topic-popup");
               wp_enqueue_script('fmwp-popup',  plugin_dir_url(__FILE__) . '/js/popup.min.js');
               wp_enqueue_script('fmwp-topic-popup',  plugin_dir_url(__FILE__) . '/js/topic-popup-custom.js');
               wp_enqueue_script('extension-multifiles',  plugin_dir_url(__FILE__) . '/js/jquery.MultiFile.min.js');
               wp_enqueue_script('extension-script',  plugin_dir_url(__FILE__) . '/js/extension.js');
               wp_localize_script('fmwp-topic-popup', 'ajaxvars', array('ajaxurl' => admin_url('admin-ajax.php')));
          }
          function add_popup_actions()
          {
?>
               <div class="fwe-extension mce-widget mce-btn mce-last">
                    <input type="file" class="multi" maxlength="10" name="files[]" id="fwe-extension-file" multiple>
               </div>

          <?php
          }
          function add_template_actions($fmwp_topic_id, $fmwp_topic)
          {
               $files = get_post_meta($fmwp_topic_id, 'uploaded_files');
               foreach ($files as $files) {
               }

          ?>


<?php
          }
          function create_filter($args, $topic_data = [])
          {
               // for multiple file upload.
               $upload_overrides = array('test_form' => false);
               $files = $_FILES['files'];
               $files_array = [];
               foreach ($files['name'] as $key => $value) {
                    if ($files['name'][$key]) {
                         $file = array(
                              'name' => sanitize_file_name(files['name'][$key]),
                              'type' => $files['type'][$key],
                              'tmp_name' => $files['tmp_name'][$key],
                              'error' => $files['error'][$key],
                              'size' => $files['size'][$key]
                         );

                         $movefile = wp_handle_upload($file, $upload_overrides);
                         if ($movefile && !isset($movefile['error'])) {
                              $files_array[] = $movefile['url'];
                         }
                    }
               }
               $args['meta_input'] = array(
                    'uploaded_files' => $files_array
               );

               return $args;
          }

          // private function edit_filter(&$args, $topic_data){
          //      $args['meta_input'] = 
          // }
          // private function ajax_create_filter(&$args, $topic_data){
          //      $args[''] = 
          // }
          // private function ajax_edit_filter($args, $topic_data)
          // {

          // }

     }
     new FWE_Builder();
} else {
     throw new Exception('Error. The plugin could not have been inicialized.');
}
