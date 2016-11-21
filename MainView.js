var nav = require("assets/js/navigation");

nav.menuVisible.value = 'Collapsed';

function goHome() {
  router.goto( 'timeline' );
}

function goMentions() {
  router.goto( 'mentions' );
}

module.exports = {
  menuVisible: nav.menuVisible,
  goHome: goHome,
  goMentions: goMentions
}
