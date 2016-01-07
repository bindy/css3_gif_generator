<?php

$data = json_decode(file_get_contents("php://input"),true);
if($data){
  $serverRoot = str_replace("/compress.php", "", $_SERVER["SCRIPT_FILENAME"]);
  $serverPath = $serverRoot.DIRECTORY_SEPARATOR;

  $pic = $pic_id = null;

  if(isset($data['pic']))   $pic = $data['pic'];
  if(isset($data['id'])) $pic_id = $data['id'];
  if(isset($data['percentage'])) $percentage = $data['percentage'];


//若传过来的是图片的数据，那么处理图片
  if($pic){

    $img_data = base64_decode(str_replace('data:image/png;base64,', "", $pic));

    $id = time();


    $rela_img_path = 'data'.DIRECTORY_SEPARATOR.$id.DIRECTORY_SEPARATOR;
    $img_path = $serverPath.$rela_img_path;


    if(!is_dir($img_path)){
      mkdir($img_path, 0755, true);
    }

    $file_data = $img_path.'data.png';

    $dest_data = $img_path.'data-fs8.png';

    file_put_contents($file_data, $img_data);

  }
//若传过来的是图片的id，那么从服务器获取
  if($pic_id){
   $rela_img_path = 'data'.DIRECTORY_SEPARATOR.$pic_id.DIRECTORY_SEPARATOR;
   $img_path = $serverPath.$rela_img_path;
   $file_data = $img_path.'data.png';
   $dest_data = $img_path.'data-fs8.png';
 }

 $uncompSize = filesize($file_data);


 $compressfile = compress_png($file_data,$percentage);

 file_put_contents($dest_data, $compressfile);

 $compSize = filesize($dest_data);

 $return = $uncompSize.'|'.$compSize.'|'.$rela_img_path.'data-fs8.png|'.$rela_img_path.'data.png|'.$id;
 echo json_encode($return);


}
function compress_png($path_to_png_file, $max_quality = 90)
{
  if (!file_exists($path_to_png_file)) {
    throw new Exception("File does not exist: $path_to_png_file");
  }

    // guarantee that quality won't be worse than that.
  $min_quality = 50;

    // '-' makes it use stdout, required to save to $compressed_png_content variable
    // '<' makes it read from the given file path
    // escapeshellarg() makes this safe to use with any path
  $compressed_png_content = shell_exec("pngquant --quality=$min_quality-$max_quality - < ".escapeshellarg(    $path_to_png_file));

  if (!$compressed_png_content) {
    throw new Exception("Conversion to compressed PNG failed. Is pngquant 1.8+ installed on the server?");
  }

  return $compressed_png_content;
}


?>