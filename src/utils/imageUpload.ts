// ==========================================================================
// PROCESSAMENTO, REDIMENSIONAMENTO E UPLOAD DE IMAGENS (SUPABASE STORAGE)
// ==========================================================================

import { supabase } from '../lib/supabase';

const BUCKET_PRODUTOS = 'produtos';

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

export function redimensionarImagemParaBlob(
  file: File,
  maxWidth = 900,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
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

        // Preenche fundo branco para imagens PNG com transparência salvas em JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar arquivo otimizado da imagem.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export interface ResultadoUploadImagem {
  url: string;
  origem: 'supabase' | 'local';
}

export async function uploadImagemProdutoSupabase(
  file: File
): Promise<ResultadoUploadImagem> {
  const blob = await redimensionarImagemParaBlob(file, 900, 0.85);
  const sufixoAleatorio = Math.random().toString(36).slice(2, 8);
  const nomeArquivo = `prod-${Date.now()}-${sufixoAleatorio}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET_PRODUTOS)
    .upload(nomeArquivo, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.warn(
      'Não foi possível enviar ao Supabase Storage (usando fallback local):',
      error.message
    );
    const base64Fallback = await redimensionarImagemUpload(file, 520, 0.82);
    return { url: base64Fallback, origem: 'local' };
  }

  const { data } = supabase.storage
    .from(BUCKET_PRODUTOS)
    .getPublicUrl(nomeArquivo);

  return { url: data.publicUrl, origem: 'supabase' };
}

export async function excluirImagemProdutoSupabase(urlImagem?: string) {
  const marcador = `/storage/v1/object/public/${BUCKET_PRODUTOS}/`;
  if (!urlImagem || !urlImagem.includes(marcador)) {
    return;
  }

  const partes = urlImagem.split(marcador);
  const caminhoArquivo = partes[1];
  if (!caminhoArquivo) return;

  const { error } = await supabase.storage
    .from(BUCKET_PRODUTOS)
    .remove([decodeURIComponent(caminhoArquivo)]);

  if (error) {
    console.warn('Aviso ao remover imagem antiga do Storage:', error.message);
  }
}
