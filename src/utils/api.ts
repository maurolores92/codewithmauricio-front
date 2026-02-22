import axios from 'axios';

type GeneratePostParams = {
  topic: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
};

type GeneratePostResponse = {
  topic: string;
  content: string;
  hashtags?: string[];
  generatedAt?: string;
};

export const generatePost = async (params: GeneratePostParams): Promise<GeneratePostResponse> => {
  try {
    // TODO: Reemplazar con la URL de tu API real
    const response = await axios.post('/api/generate-post', params);
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al generar el post');
    }
    throw new Error('Error de conexión con el servidor');
  }
};
