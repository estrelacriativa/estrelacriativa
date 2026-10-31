// ==========================================================================
// PROCESSAMENTO E REDIMENSIONAMENTO DE IMAGENS (CANVAS)
// ==========================================================================

export function redimensionarImagemUpload(
  file: File | undefined | null,
  maxWidth = 520,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('Resultado de leitura inválido.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto 2D indisponível.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
