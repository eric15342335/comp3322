<?php
session_start();


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3322 Royalty Free Music</title>
    <link rel="stylesheet" href="look.css">
    <script defer src="handle.js"></script>
</head>
<body>
    <header>
        <p>3322 Royalty Free Music</p>
        <p>(Source: <a href="https://www.chosic.com/free-music/all/" target="_blank">https://www.chosic.com/free-music/all/</a>)</p>
    </header>

    <main>
        <fieldset class="login-container">
            <legend>LOG IN</legend>
            <form id="login-form" action="index.php" method="post">
                <p>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </p>

                <div class="button-container">
                    <button id="submit" type="submit">Log in</button>
                </div>
            </form>
        </fieldset>
    </main>
</body>
</html>
