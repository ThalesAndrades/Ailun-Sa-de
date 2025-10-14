import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Serviços de Storage do Supabase
 * Exemplos de upload, download e gerenciamento de arquivos
 */

// ==================== UPLOAD DE ARQUIVOS ====================

// Upload de imagem de perfil
export const uploadProfileImage = async (userId: string, fileUri: string) => {
  try {
    // Ler o arquivo como base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Converter base64 para blob
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    // Gerar nome único para o arquivo
    const fileExt = fileUri.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;

    // Upload para o bucket
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) throw error;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl, path: data.path };
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error.message);
    return { success: false, error: error.message };
  }
};

// Upload de documento médico
export const uploadMedicalDocument = async (userId: string, fileUri: string, fileName: string) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    const fileExt = fileUri.split('.').pop();
    const filePath = `${userId}/documents/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('medical-documents')
      .upload(filePath, arrayBuffer, {
        contentType: `application/${fileExt}`,
      });

    if (error) throw error;

    return { success: true, path: data.path };
  } catch (error: any) {
    console.error('Erro ao fazer upload do documento:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== DOWNLOAD DE ARQUIVOS ====================

// Obter URL pública de um arquivo
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Obter URL assinada (privada, com expiração)
export const getSignedUrl = async (bucket: string, path: string, expiresIn: number = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (error: any) {
    console.error('Erro ao gerar URL assinada:', error.message);
    return { success: false, error: error.message };
  }
};

// Download de arquivo
export const downloadFile = async (bucket: string, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao baixar arquivo:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== GERENCIAMENTO DE ARQUIVOS ====================

// Listar arquivos de um usuário
export const listUserFiles = async (bucket: string, userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;
    return { success: true, files: data };
  } catch (error: any) {
    console.error('Erro ao listar arquivos:', error.message);
    return { success: false, error: error.message };
  }
};

// Remover arquivo
export const removeFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover arquivo:', error.message);
    return { success: false, error: error.message };
  }
};

// Mover/renomear arquivo
export const moveFile = async (bucket: string, fromPath: string, toPath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao mover arquivo:', error.message);
    return { success: false, error: error.message };
  }
};

