export default function ghPagesSpa() {
  return {
    name: 'gh-pages-spa',
    generateBundle(options, bundle) {
      // Copie index.html vers 404.html
      const indexHtml = bundle['index.html'];
      if (indexHtml) {
        this.emitFile({
          type: 'asset',
          fileName: '404.html',
          source: indexHtml.source
        });
      }
    }
  };
}