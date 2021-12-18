<?php


if ((!class_exists('FWE_Functions'))) {


     class FWE_Functions
     {
          const FWE_ICON_CLASSES = array(
               'image' => 'fas fa-image',
               'audio' => 'fas fa-file-audio',
               'video' => 'fas fa-file-video',
               // Documents
               'application/pdf' => 'fas fa-file-pdf',
               'application/msword' => 'fas fa-file-word',
               'application/vnd.ms-word' => 'fas fa-file-word',
               'application/vnd.oasis.opendocument.text' => 'fas fa-file-word',
               'application/vnd.openxmlformats-officedocument.wordprocessingml' => 'fas fa-file-word',
               'application/vnd.ms-excel' => 'fas fa-file-excel',
               'application/vnd.openxmlformats-officedocument.spreadsheetml' => 'fas fa-file-excel',
               'application/vnd.oasis.opendocument.spreadsheet' => 'fas fa-file-excel',
               'application/vnd.ms-powerpoint' => 'fas fa-file-powerpoint',
               'application/vnd.openxmlformats-officedocument.presentationml' => 'fas fa-file-powerpoint',
               'application/vnd.oasis.opendocument.presentation' => 'fas fa-file-powerpoint',
               'text/plain' => 'fas fa-file-alt',
               'text/html' => 'fas fa-file-code',
               'application/json' => 'fas fa-file-code',
               // Archives
               'application/gzip' => 'fas fa-file-archive',
               'application/zip' => 'fas fa-file-archive',
          );

          function get_file_icon($mime_type)
          {
               // List of official MIME Types: http://www.iana.org/assignments/media-types/media-types.xhtml

               foreach (self::FWE_ICON_CLASSES as $text => $icon) {
                    if (strpos($mime_type, $text) === 0) {
                         return $icon;
                    }
               }
               return 'fas fa-file';
          }
     }
}
