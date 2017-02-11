<?php



if($_SERVER['REQUEST_METHOD'] == 'POST' AND isset($_POST['submit'])) {

	$file_name = 'TimeLog.csv';
	$file = fopen($file_name, 'w+');
	if(count($_POST) > 1) {

		fwrite($file, "Date, Time Spent\n");

		foreach ($_POST as $key => $value) {
			if($key !== "submit") {
				fwrite($file, parseUnixDate($key).",".parseMillisDuration($value)."\n");
				

			} 
		}

		// Discription
		header('Content-Description: File Transfer');
	    header('Content-Type: application/octet-stream');
	    header('Content-Disposition: attachment; filename="'.basename($file_name).'"');
		
		// Avoid caching
		header('Expires: 0');
	    header('Cache-Control: must-revalidate');
	    header('Pragma: public');

		// File Size
		header('Content-Length: ' . filesize($file_name));

		readfile($file_name);
		
		fclose($file);

	}
}

function parseUnixDate($timestamp) {

	$timestamp =  round((intval($timestamp) / 1000));
	$today = date('D M d');
	
	return "$today";

}

function parseMillisDuration($timestamp) {
	$seconds = $timestamp / 1000;
	$minutes = round($seconds / 60);
	$hours = floor($minutes / 60);

	if($hours) {

		return "$hours Hrs ".($minutes % 60)." Min";
	} else {
		return ($minutes % 60)." Min ".($seconds % 60)." Sec";
	}
}