var nav = require("assets/js/navigation");

nav.menuVisible.value = 'Collapsed';

function goHome() {
  router.goto( 'timeline' );
}

function goNotifications() {
  router.goto( 'notifications' );
}

function goWrite() {
  router.goto( 'write' );
}

module.exports = {
  menuVisible: nav.menuVisible,
  goHome: goHome,
  goNotifications: goNotifications,
  goWrite: goWrite
}
