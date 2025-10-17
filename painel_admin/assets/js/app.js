document.addEventListener('DOMContentLoaded', function(){
  // Demo: set current user
  var user = document.getElementById('currentUser');
  if(user) user.textContent = 'Admin Demo';
  // Mobile sidebar toggle (if present)
  var toggle = document.getElementById('sidebarToggle');
  if(toggle) toggle.addEventListener('click', function(){ 
    var sb = document.getElementById('siteSidebar');
    if(sb) sb.style.display = (sb.style.display === 'block' ? 'none' : 'block');
  });
});
