import apiConnector from "./api.service";

export interface LoginRequest {
  username?: string;
  password?: string;
}

const authService = {
  login: async (loginRequest: LoginRequest): Promise<any> => {
      const response: any = await apiConnector.post('/auth/login', loginRequest);
      if(response && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response));
      }

return response;
  },
  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('role');

    return true;
  }
}
export default authService;
