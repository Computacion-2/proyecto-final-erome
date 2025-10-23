import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  Student, 
  Role, 
  Permission, 
  Semester,
  UserFormData,
  StudentFormData,
  RoleFormData
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return this.api.post('/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AxiosResponse<User>> {
    return this.api.post('/auth/register', userData);
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<{ accessToken: string }>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<AxiosResponse<void>> {
    return this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.api.get('/auth/me');
  }

  // User management endpoints
  async getUsers(): Promise<AxiosResponse<User[]>> {
    return this.api.get('/users');
  }

  async getUserById(id: number): Promise<AxiosResponse<User>> {
    return this.api.get(`/users/${id}`);
  }

  async createUser(userData: UserFormData): Promise<AxiosResponse<User>> {
    return this.api.post('/users', userData);
  }

  async updateUser(id: number, userData: UserFormData): Promise<AxiosResponse<User>> {
    return this.api.put(`/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/users/${id}`);
  }

  async getUsersByRole(roleId: number): Promise<AxiosResponse<User[]>> {
    return this.api.get(`/users/role/${roleId}`);
  }

  // Student management endpoints
  async getStudents(): Promise<AxiosResponse<Student[]>> {
    return this.api.get('/students');
  }

  async getStudentById(id: number): Promise<AxiosResponse<Student>> {
    return this.api.get(`/students/${id}`);
  }

  async createStudent(studentData: StudentFormData): Promise<AxiosResponse<Student>> {
    return this.api.post('/students', studentData);
  }

  async updateStudent(id: number, studentData: StudentFormData): Promise<AxiosResponse<Student>> {
    return this.api.put(`/students/${id}`, studentData);
  }

  async deleteStudent(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/students/${id}`);
  }

  // Role management endpoints
  async getRoles(): Promise<AxiosResponse<Role[]>> {
    return this.api.get('/roles');
  }

  async getRoleById(id: number): Promise<AxiosResponse<Role>> {
    return this.api.get(`/roles/${id}`);
  }

  async createRole(roleData: RoleFormData): Promise<AxiosResponse<Role>> {
    return this.api.post('/roles', roleData);
  }

  async updateRole(id: number, roleData: RoleFormData): Promise<AxiosResponse<Role>> {
    return this.api.put(`/roles/${id}`, roleData);
  }

  async deleteRole(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/roles/${id}`);
  }

  // Permission management endpoints
  async getPermissions(): Promise<AxiosResponse<Permission[]>> {
    return this.api.get('/permissions');
  }

  // Semester management endpoints
  async getSemesters(): Promise<AxiosResponse<Semester[]>> {
    return this.api.get('/semesters');
  }

  async getSemesterById(id: number): Promise<AxiosResponse<Semester>> {
    return this.api.get(`/semesters/${id}`);
  }

  // Test endpoint
  async testConnection(): Promise<AxiosResponse<{ message: string }>> {
    return this.api.get('/test');
  }
}

export default new ApiService();
