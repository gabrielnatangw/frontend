// UI Components
export { default as Button } from './ui/button';
export { default as Carousel } from './ui/carousel';
export { default as HeroCarousel } from './ui/hero-carousel';
export { default as ButtonIcon } from './ui/button-icon';
export { default as Container } from './ui/container';
export { default as Tabs } from './ui/tabs';
export { default as Stepper } from './ui/stepper';
export { default as Input } from './ui/input';
export { default as Label } from './ui/label';
export { default as Avatar } from './ui/avatar';
export { default as ProfileDropdown } from './ui/profile-dropdown';
export { Textarea } from './ui/textarea';
export { Switch } from './ui/switch';
export { Badge } from './ui/badge';
export { Checkbox } from './ui/checkbox';
export { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
export {
  Select as SelectEnhanced,
  SelectContent as SelectContentEnhanced,
  SelectItem as SelectItemEnhanced,
  SelectTrigger as SelectTriggerEnhanced,
  SelectValue as SelectValueEnhanced,
} from './ui/select-enhanced';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
export { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
export { LoadingSpinner } from './ui/loading-spinner';
export { ErrorMessage } from './ui/error-message';
export { ErrorRecovery } from './ui/error-recovery';

// Layout Components
export { default as Sidebar } from './sidebar';
export { default as CardPrimary } from './card-primary';
export { default as Header } from './layout/Header';
export { default as AuthLayout } from './layout/AuthLayout';
export { default as PtraceLayout } from './layout/PtraceLayout';
export { default as Topbar } from './topbar';
export { default as HomeTopbar } from './topbar/HomeTopbar';

// Dashboard Components
export { default as DashboardGrid } from './dashboard-grid';
export { default as Gauge } from './gauge';
export { default as OnOffIndicator } from './onoff-indicator';
export { default as StepChart } from './stepchart';

// Chart Components
export { default as ChartTypePreview } from './charts/preview';

// Logo Components
export { default as Ptrace } from './logos/ptrace';

// Data Components
export { default as DataCard } from './data-card';

// Card Creator Component
export { default as CardCreator } from './card-creator';

// Admin Components
export { default as RoleCard } from './admin/roles/RoleCard';
export { default as RoleSelector } from './admin/roles/RoleSelector';
export { default as PermissionGrid } from './admin/permissions/PermissionGrid';
export { default as UserRoleManager } from './admin/user-roles/UserRoleManager';

// Permission Components
export { default as PermissionGuard } from './permissions/PermissionGuard';
export { useHasPermissionHook } from './permissions/use-permission-hook';

// Re-export types
export type { SidebarItem, SidebarProps } from './sidebar';
export type {
  CardPrimaryRootProps,
  CardPrimaryHeaderProps,
  CardPrimaryBodyProps,
  CardPrimaryListProps,
  CardPrimaryListItemProps,
} from './card-primary';
export type { DashboardGridProps, GridLayout } from './dashboard-grid';
export type { GaugeProps, GaugeColors } from './gauge';
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './ui/tabs';
export type { StepperProps, Step, StepStatus } from './ui/stepper';
export type { PreviewChartType } from './charts/preview';
export type { DataCardProps, DataCardField, DataCardAction } from './data-card';

// Re-export stores and hooks
export { useAuthStore } from '../lib/stores/auth-store';
export {
  useAuth,
  useLogin,
  useLogout,
  useRefreshToken,
  useVerifyToken,
  useForgotPassword,
  useFirstLogin,
  useSessions,
  useEndSession,
  useAuthErrorInterceptor,
  authKeys,
} from '../lib/hooks/use-auth';

// Re-export user hooks and types
export {
  useUsers,
  useUser,
  useProfile,
  useUserStats,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
  useActivateUser,
  useDeactivateUser,
  useChangePassword,
  useSetPassword,
  useResetPassword,
  useUserByEmail,
  useUsersByTenant,
  useUsersByRole,
  useTenantAdmins,
  useFirstTenantAdmin,
  useUserSearch,
  userKeys,
} from '../lib/hooks/use-users';

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
  UserStats,
  ListUsersParams,
  ListUsersResponse,
  UserResponse,
  UserStatsResponse,
  ApiError as UserApiError,
} from '../types/user';

// Re-export module hooks and types
export {
  useModules,
  useModule,
  useModuleStats,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useRestoreModule,
  moduleKeys,
} from '../lib/hooks/use-modules';

export type {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  ModuleStats,
  ListModulesParams,
  ListModulesResponse,
  ModuleResponse,
  ModuleStatsResponse,
} from '../types/module';

// Re-export sensor hooks and types
export {
  useSensors,
  useSensor,
  useSensorStats,
  useCreateSensor,
  useUpdateSensor,
  useDeleteSensor,
  useRestoreSensor,
  sensorKeys,
} from '../lib/hooks/use-sensors';

export type {
  Sensor,
  CreateSensorRequest,
  UpdateSensorRequest,
  SensorStats,
  ListSensorsParams,
  ListSensorsResponse,
  SensorResponse,
  SensorStatsResponse,
} from '../types/sensor';

// Re-export measurement unit hooks and types
export {
  useMeasurementUnits,
  useMeasurementUnit,
  useMeasurementUnitStats,
  useCreateMeasurementUnit,
  useUpdateMeasurementUnit,
  useDeleteMeasurementUnit,
  useRestoreMeasurementUnit,
  measurementUnitKeys,
} from '../lib/hooks/use-measurement-units';

export type {
  MeasurementUnit,
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
  MeasurementUnitStats,
  ListMeasurementUnitsParams,
  ListMeasurementUnitsResponse,
  MeasurementUnitResponse,
  CreateMeasurementUnitResponse,
  UpdateMeasurementUnitResponse,
  RestoreMeasurementUnitResponse,
  DeleteMeasurementUnitResponse,
  MeasurementUnitStatsResponse,
} from '../types/measurement-unit';

// Re-export schemas
export * from '../lib/schemas/auth';
export * from '../lib/schemas/common';

// Re-export lib hooks
export { useNotifications } from '../lib/hooks/use-notifications';
export { useDebounce } from '../lib/hooks/use-debounce';
export { useOfflineSupport } from '../lib/hooks/use-offline-support';
export { useErrorHandler } from '../lib/hooks/use-error-handler';
export { useAuditLogging } from '../lib/hooks/use-audit-logging';
export {
  useRolesOptimized,
  useRoleStatsOptimized,
  useCreateRoleOptimized,
  useUpdateRoleOptimized,
  useDeleteRoleOptimized,
} from '../lib/hooks/use-roles-optimized';
export {
  useDuplicateRole,
  useToggleRoleStatus,
  useRestoreRole,
  useExportRoles,
  useImportRoles,
} from '../lib/hooks/use-role-actions';
export { useBulkRoleOperations } from '../lib/hooks/use-bulk-role-operations';
export { BulkActionsBar } from '../components/admin/roles/BulkActionsBar';

// Re-export roles hooks and types
export {
  useRoles,
  useRole,
  useRoleStats,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  roleKeys,
} from '../lib/hooks/use-roles';

export type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleStats,
  ListRolesParams,
  ListRolesResponse,
  RoleResponse,
  RoleStatsResponse,
} from '../types/role';

// Re-export permissions hooks and types
// Novo sistema de permissões
export {
  useApplications,
  usePTraceApplication,
  useAppPermissions,
  useHasPermission,
  APPLICATION_IDS,
  DEFAULT_APPLICATION_ID,
} from '../lib/hooks/use-app-permissions';

export type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionStats,
  ListPermissionsParams,
  ListPermissionsResponse,
  PermissionResponse,
  PermissionStatsResponse,
} from '../types/permission';

// Re-export user-roles hooks and types
export {
  useUserRoles,
  useUserRole,
  useUserRoleStats,
  useAssignRole,
  useUnassignRole,
  useAssignMultipleRoles,
  useUnassignMultipleRoles,
  userRoleKeys,
} from '../lib/hooks/use-user-roles';

export type {
  UserRole,
  UserRoleStats,
  ListUserRolesParams,
  ListUserRolesResponse,
  UserRoleResponse,
  UserRoleStatsResponse,
} from '../types/user-role';

// Re-export API config
export * from '../lib/api/config';
export { authApi } from '../lib/api/auth';
export { modulesApi } from '../lib/api/modules';
export { sensorsApi } from '../lib/api/sensors';
export { measurementUnitsApi } from '../lib/api/measurement-units';
export { rolesApi } from '../lib/api/roles';
// Novo sistema de permissões
export { userPermissionsApi } from '../lib/api/user-permissions';
export { userRolesApi } from '../lib/api/user-roles';
export { auditLogsApi } from '../lib/api/audit-logs';

// Audit Logs
export {
  useAuditLogs,
  useAuditLog,
  useAuditStats,
  auditLogKeys,
} from '../lib/hooks/use-audit-logs';
