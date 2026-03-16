
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", function(e) {
    const url = this.href;

    // Se il link è interno e diverso dalla pagina attuale
    if (url !== window.location.href && !url.includes('#')) {
      e.preventDefault();
      
      document.body.classList.add("page-exit");

      setTimeout(() => {
        window.location.href = url;
      }, 500); // Assicurati che coincida con la durata CSS
    }
  });
});