export interface View {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  permission: 'READ' | 'WRITE' | 'ADMIN' | 'SHARE';
  sharedWith?: ViewUser[];
  permissions?: ViewPermission[];
  cards?: ViewCard[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface ViewUser {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  permission: 'READ' | 'WRITE' | 'ADMIN' | 'SHARE';
  grantedAt: string;
  grantedBy: string;
}

export interface ViewPermission {
  id: string;
  permissionId: string;
  permissionName: string;
  permissionDescription: string;
  grantedAt: string;
  grantedBy: string;
}

export interface CreateViewRequest {
  name: string;
  description: string;
  isPublic: boolean;
  permission: 'READ' | 'WRITE' | 'ADMIN' | 'SHARE';
  sharedWith?: string[];
  permissionIds?: string[];
}

export interface UpdateViewRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  permission?: 'READ' | 'WRITE' | 'ADMIN' | 'SHARE';
  sharedWith?: string[];
  permissionIds?: string[];
}

export interface ListViewsParams {
  page?: number;
  limit?: number;
  search?: string;
  permission?: 'READ' | 'WRITE' | 'ADMIN' | 'SHARE';
  isPublic?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  my?: boolean;
}

export interface ListViewsResponse {
  data: {
    views: View[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  success: boolean;
  message: string;
}

// Resposta específica para /views/my/complete que retorna array direto
export interface MyViewsCompleteResponse {
  data: View[];
  success: boolean;
  message: string;
}

export interface ViewResponse {
  data: View;
  success: boolean;
  message: string;
}

export interface ViewStatsResponse {
  data: {
    total: number;
    public: number;
    private: number;
    shared: number;
    byPermission: {
      READ: number;
      WRITE: number;
      ADMIN: number;
      SHARE: number;
    };
  };
  success: boolean;
  message: string;
}

// View Card types
export interface ViewCard {
  id: string;
  viewId: string;
  sensorId: string;
  title: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateViewCardData {
  sensorId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface UpdateViewCardData {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

// Chart types
export type ChartType = 'LINE' | 'BAR' | 'GAUGE' | 'ONOFF' | 'STEP';

// Sensor data types
export interface SensorCurrentValue {
  sensorId: string;
  value: number;
  rawValue?: number;
  unit: string;
  timestamp: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'error';
  quality?: string;
  isStale?: boolean;
}

export interface UpdateSensorCurrentData {
  sensorId: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'error';
  quality?: string;
}
