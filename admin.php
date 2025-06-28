<?php
session_start();
if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    header('Location: login.php');
    exit;
}

$jsonFile = 'products.json';

function getProducts() {
    global $jsonFile;
    if (!file_exists($jsonFile)) return [];
    $jsonData = file_get_contents($jsonFile);
    return json_decode($jsonData, true);
}

function saveProducts($products) {
    global $jsonFile;
    file_put_contents($jsonFile, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Adicionar produto
if (isset($_POST['addProduct'])) {
    $id = uniqid();
    $name = $_POST['name'];
    $price = floatval($_POST['price']);
    $flavor = $_POST['flavor'];
    $category = $_POST['category'];
    $bestseller = isset($_POST['bestseller']) ? true : false;
    $soldout = isset($_POST['soldout']) ? true : false;

    $image = '';
    if (!empty($_FILES['image']['name'])) {
        $image = 'img/' . $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], $image);
    }

    $products = getProducts();

    $products[] = [
        'id' => $id,
        'name' => $name,
        'price' => $price,
        'image' => $image,
        'bestseller' => $bestseller,
        'soldout' => $soldout,
        'description' => $flavor,
        'category' => $category
    ];

    saveProducts($products);
}

// Remover produto
if (isset($_POST['removeProduct'])) {
    $index = $_POST['index'];
    $products = getProducts();
    unset($products[$index]);
    $products = array_values($products);
    saveProducts($products);
}

// Editar produto
if (isset($_POST['editProduct'])) {
    $index = $_POST['index'];
    $products = getProducts();

    $name = $_POST['name'];
    $price = floatval($_POST['price']);
    $flavor = $_POST['flavor'];
    $category = $_POST['category'];
    $bestseller = isset($_POST['bestseller']) ? true : false;
    $soldout = isset($_POST['soldout']) ? true : false;

    $products[$index]['name'] = $name;
    $products[$index]['price'] = $price;
    $products[$index]['bestseller'] = $bestseller;
    $products[$index]['soldout'] = $soldout;
    $products[$index]['description'] = $flavor;
    $products[$index]['category'] = $category;

    if (!empty($_FILES['image']['name'])) {
        $image = 'img/' . $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], $image);
        $products[$index]['image'] = $image;
    }

    saveProducts($products);
}

// Filtro por categoria
$selectedCategory = $_GET['category'] ?? 'todas';
$products = getProducts();
if ($selectedCategory !== 'todas') {
    $products = array_filter($products, function($p) use ($selectedCategory) {
        return isset($p['category']) && $p['category'] === $selectedCategory;
    });
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Administração de Produtos</title>
  <link rel="stylesheet" href="css/cart.css" />
  <style>
    .product-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 0;
    }
    .product-item {
        display: flex;
        gap: 20px;
        align-items: center;
        background: #f9f9f9;
        padding: 15px;
        border-radius: 10px;
        flex-wrap: wrap;
    }
    .product-item img {
        max-width: 100px;
        border-radius: 8px;
    }
    .product-item form {
        display: inline-block;
        margin: 0 5px;
    }
  </style>
</head>
<body>

<h1>Administração de Produtos</h1>

<h2>Adicionar Produto</h2>
<form method="POST" enctype="multipart/form-data">
  <label>Nome:</label>
  <input type="text" name="name" required><br>
  <label>Preço:</label>
  <input type="text" name="price" required><br>
  <label>Sabor (descrição):</label>
  <input type="text" name="flavor" required><br>
  <label>Categoria:</label>
  <select name="category" required>
    <option value="fogazza">Fogazza</option>
    <option value="salgado">Salgado</option>
    <option value="refrigerante">Refrigerante</option>
    <option value="outros">Outros</option>
  </select><br>
  <label>Mais Vendido:</label>
  <input type="checkbox" name="bestseller"><br>
  <label>Esgotado:</label>
  <input type="checkbox" name="soldout"><br>
  <label>Imagem:</label>
  <input type="file" name="image" accept="image/*" required><br>
  <button type="submit" name="addProduct">Adicionar Produto</button>
</form>

<h2>Filtrar por Categoria</h2>
<form method="GET" style="margin-bottom: 20px;">
  <select name="category" onchange="this.form.submit()">
    <option value="todas" <?= $selectedCategory === 'todas' ? 'selected' : '' ?>>Todas</option>
    <option value="fogazza" <?= $selectedCategory === 'fogazza' ? 'selected' : '' ?>>Fogazza</option>
    <option value="salgado" <?= $selectedCategory === 'salgado' ? 'selected' : '' ?>>Salgado</option>
    <option value="refrigerante" <?= $selectedCategory === 'refrigerante' ? 'selected' : '' ?>>Refrigerante</option>
    <option value="outros" <?= $selectedCategory === 'outros' ? 'selected' : '' ?>>Outros</option>
  </select>
</form>

<h2>Lista de Produtos</h2>
<ul class="product-list">
  <?php foreach ($products as $index => $product): ?>
    <li class="product-item">
      <img src="<?php echo $product['image']; ?>" alt="<?php echo $product['name']; ?>">
      <div>
        <h3><?php echo $product['name']; ?></h3>
        <p>Preço: R$ <?php echo number_format($product['price'], 2, ',', '.'); ?></p>
        <p>Descrição: <?php echo $product['description']; ?></p>
        <p>Categoria: <?php echo ucfirst($product['category'] ?? 'N/A'); ?></p>
        <p><?php echo !empty($product['bestseller']) ? '🔥 Mais Vendido' : ''; ?></p>
        <p><?php echo !empty($product['soldout']) ? '❌ Esgotado' : ''; ?></p>
      </div>

      <!-- Remover -->
      <form method="POST">
        <input type="hidden" name="index" value="<?php echo $index; ?>">
        <button type="submit" name="removeProduct">Remover</button>
      </form>

      <!-- Editar -->
      <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="index" value="<?php echo $index; ?>">
        <input type="text" name="name" value="<?php echo $product['name']; ?>" required>
        <input type="text" name="price" value="<?php echo $product['price']; ?>" required>
        <input type="text" name="flavor" value="<?php echo $product['description']; ?>" required>
        <select name="category" required>
          <option value="fogazza" <?= $product['category'] === 'fogazza' ? 'selected' : '' ?>>Fogazza</option>
          <option value="salgado" <?= $product['category'] === 'salgado' ? 'selected' : '' ?>>Salgado</option>
          <option value="refrigerante" <?= $product['category'] === 'refrigerante' ? 'selected' : '' ?>>Refrigerante</option>
          <option value="outros" <?= $product['category'] === 'outros' ? 'selected' : '' ?>>Outros</option>
        </select>
        <label>Mais Vendido:</label>
        <input type="checkbox" name="bestseller" <?= !empty($product['bestseller']) ? 'checked' : ''; ?>>
        <label>Esgotado:</label>
        <input type="checkbox" name="soldout" <?= !empty($product['soldout']) ? 'checked' : ''; ?>>
        <label>Nova imagem:</label>
        <input type="file" name="image" accept="image/*">
        <button type="submit" name="editProduct">Editar</button>
      </form>
    </li>
  <?php endforeach; ?>
</ul>

</body>
</html>
