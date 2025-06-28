<?php
session_start();

// Defina seu usuário e senha
$usuario_correto = 'suzanalinda';
$senha_correta = '1332';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = $_POST['usuario'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if ($usuario === $usuario_correto && $senha === $senha_correta) {
        $_SESSION['logado'] = true;
        header('Location: admin.php'); // Redireciona para o painel
        exit;
    } else {
        $erro = "Usuário ou senha incorretos.";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Login - Administração</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ffcc70, #ff7c70);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        form {
            background-color: #fff;
            padding: 30px 40px;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            width: 100%;
            max-width: 380px;
            text-align: center;
        }

        .logo {
            width: 120px;
            height: auto;
            margin: 0 auto 20px;
        }

        h2 {
            margin-bottom: 25px;
            color: #333;
        }

        input {
            width: 100%;
            padding: 12px 14px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            transition: 0.2s;
        }

        input:focus {
            border-color: #ff7c70;
            outline: none;
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #ff7c70;
            border: none;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.3s;
        }

        button:hover {
            background-color: #ff5e5e;
        }

        .erro {
            color: #d60000;
            background-color: #ffe6e6;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 6px;
        }
    </style>
</head>
<body>

<form method="POST">
    <!-- Logo -->
    <img src="img/LOGO3.png" alt="Logo" class="logo">
    
    <h2>Área Restrita</h2>

    <?php if (!empty($erro)) echo "<p class='erro'>$erro</p>"; ?>

    <input type="text" name="usuario" placeholder="Usuário" required>
    <input type="password" name="senha" placeholder="Senha" required>
    <button type="submit">Entrar</button>
</form>

</body>
</html>
