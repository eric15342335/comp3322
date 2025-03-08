<!DOCTYPE>
<html>
<head>
<title>TEST MYSQL</title>
</head>
<body>
  <h1>Testing MYSQL connection with PHP</h1>

<?php

  define("DB_HOST", "mydb");
  define("USERNAME", "dummy");
  define("PASSWORD", "c3322b");
  define("DB_NAME", "db3322");

	$conn=mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME) or die("Connection Error!".mysqli_connect_error());

  // Attempt create table query execution
  $sql = "CREATE TABLE courses(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL
  )";
  if(mysqli_query($conn, $sql)){
    echo "<p>Table created successfully.</p>";
  } else{
    echo "ERROR: Could not able to execute $sql. " . mysqli_error($conn);
  }

  // Attempt insert query execution
  $sql = "INSERT INTO courses (code, name) VALUES ('COMP3322B', 'Modern Technologies on WWW')";
  if(mysqli_query($conn, $sql)){
    echo "<p>Records inserted successfully.</p>";
  } else{
    echo "ERROR: Could not able to execute $sql. " . mysqli_error($conn);
  }

  $sql = "select * from courses";
  $result = mysqli_query($conn, $sql) or die('Error! '.mysqli_error($conn));
	while($row = mysqli_fetch_array($result)) {
    echo "<p>Course code : ".$row['code']."<br>";
    echo "Course title : ".$row['name']."</p>";
	}

  mysqli_close($conn);

?>

</body>
</html>
