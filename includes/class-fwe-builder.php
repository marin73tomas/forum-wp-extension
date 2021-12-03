<?php

if (!class_exists('FWE_Builder') || !class_exists('fmwp\ajax\Topic')) {

     class FWE_Builder
     {
          public function __construct()
          {
               add_action('fmwp_topic_popup_actions', array($this, 'add_popup_actions'));
               wp_enqueue_script('extension-script',  plugin_dir_url(__FILE__) . '/js/extension.js');
               // add_filter('fmwp_ajax_create_topic_args', array($this, 'create_filter'));
               // add_filter('fmwp_ajax_edit_topic_args', array($this, 'edit_filter'));
               // add_filter('fmwp_create_topic_args', array($this, 'create_filter'));
               // add_filter('fmwp_edit_topic_args', array($this, 'edit_filter'));

          }
          private function add_popup_actions()
          {
?>

               <div class="fwe-extension">
                    <input type="file" class="multi" name="fwe-extension-file" id="fwe-extension-file" accept=" image/*,.pdf,.doc,.docx">
               </div>

<?php
          }
          // private function create_filter(&$args, $topic_data){
          //      $args['meta_input'] = 
          // }

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
