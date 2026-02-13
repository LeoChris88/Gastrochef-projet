const io = require('socket.io-client');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGY2YjY3ZTMxNzRlZDM2MWU4MmU5MyIsImlhdCI6MTc3MTAwNjgyMywiZXhwIjoxNzcxMDkzMjIzfQ.veYmZp3cn930B3X-KhZ7Wo57FFRlOzL8vOI-9fYmP40';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('authenticated', (data) => {
  console.log('\n✅ Authentifié:', data);
  console.log('\n🚀 Démarrage du service...\n');
  socket.emit('start-service');
});

socket.on('service-started', (data) => {
  console.log('✅', data.message);
});

socket.on('new-order', (order) => {
  console.log('\n📋 NOUVELLE COMMANDE:');
  console.log('  - Plat:', order.recipe.name);
  console.log('  - Prix:', order.recipe.salePrice + '€');
  console.log('  - Temps:', order.timeLimit + 's');
  console.log('  - Ingrédients:', order.recipe.ingredients.map(i => `${i.quantity}x ${i.name}`).join(', '));
  
  // Servir automatiquement après 2 secondes
  setTimeout(() => {
    console.log('\n✅ Je sers la commande...\n');
    socket.emit('process-order', { orderId: order.orderId, action: 'serve' });
  }, 2000);
});

socket.on('order-completed', (data) => {
  console.log('✅ SUCCÈS:', data.message);
  console.log('  - Satisfaction:', data.satisfaction);
  console.log('  - Trésorerie:', data.treasury + '€');
  console.log('  - Gain: +' + data.treasuryChange + '€\n');
});

socket.on('order-rejected', (data) => {
  console.log('❌ ÉCHEC:', data.message);
  console.log('  - Satisfaction:', data.satisfaction);
  console.log('  - Trésorerie:', data.treasury + '€\n');
});

socket.on('treasury-update', (data) => {
  console.log('💰 Trésorerie:', data.treasury + '€');
});

socket.on('satisfaction-update', (data) => {
  console.log('😊 Satisfaction:', data.satisfaction);
});

socket.on('game-over', (data) => {
  console.log('\n💔 GAME OVER:', data.message);
  process.exit(0);
});

socket.on('error', (data) => {
  console.error('❌ Erreur:', data.message);
});

console.log('🔌 Connexion au serveur...');