// Hooks
export { useAuth, useLogout } from './hooks/use-auth';
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
} from './hooks/use-users';
export {
  useMeasurementUnits,
  useMeasurementUnit,
  useMeasurementUnitStats,
  useCreateMeasurementUnit,
  useUpdateMeasurementUnit,
  useDeleteMeasurementUnit,
  useRestoreMeasurementUnit,
} from './hooks/use-measurement-units';
export {
  useModules,
  useModule,
  useModuleStats,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useRestoreModule,
} from './hooks/use-modules';
export {
  useSensors,
  useSensor,
  useSensorStats,
  useCreateSensor,
  useUpdateSensor,
  useDeleteSensor,
  useRestoreSensor,
} from './hooks/use-sensors';
export { useNotifications } from './hooks/use-notifications';
export {
  useCreateCard,
  useUpdateCard,
  useRemoveCard,
  useUpdateCardPositions,
} from './hooks/use-card-creator';
export {
  useMachines,
  useMachine,
  useMachineStats,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
  useRestoreMachine,
  machineKeys,
} from './hooks/use-machines';
export {
  useRoles,
  useRole,
  useRoleStats,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRestoreRole,
  useDuplicateRole,
  useRolePermissions,
  useUpdateRolePermissions,
  useAddRolePermission,
  useRemoveRolePermission,
  useRoleUsers,
  roleKeys,
} from './hooks/use-roles';
// Novo sistema de permissões
export {
  useApplications,
  usePTraceApplication,
  useAppPermissions,
  useHasPermission,
  APPLICATION_IDS,
  DEFAULT_APPLICATION_ID,
} from './hooks/use-app-permissions';
export {
  useUserRoles,
  useUserRole,
  useUserRoleStats,
  useCreateUserRole,
  useUpdateUserRole,
  useDeleteUserRole,
  useUserRolesByUser,
  useUserRolesByRole,
  useAssignRole,
  useUnassignRole,
  useAssignMultipleRoles,
  useUnassignMultipleRoles,
  useAssignRoleToUsers,
  useUnassignRoleFromUsers,
  userRoleKeys,
} from './hooks/use-user-roles';
export {
  useViews,
  useView,
  useViewStats,
  useCreateView,
  useUpdateView,
  useDeleteView,
  useShareView,
  useUpdateViewPermissions,
  viewKeys,
} from './hooks/use-views';

// Integração completa de usuários (baseada em INTEGRACAO_USUARIOS.md)
export { userIntegrationApi } from './api/user-integration';
export {
  useUsers as useUsersIntegration,
  useUser as useUserIntegration,
  useUserStats as useUserStatsIntegration,
  useUserByEmail as useUserByEmailIntegration,
  useUsersByTenant as useUsersByTenantIntegration,
  useMyProfile as useMyProfileIntegration,
  useUserPermissions as useUserPermissionsIntegration,
  useUserRoles as useUserRolesIntegration,
  useCreateUser as useCreateUserIntegration,
  useUpdateUser as useUpdateUserIntegration,
  useDeleteUser as useDeleteUserIntegration,
  useRestoreUser as useRestoreUserIntegration,
  useActivateUser as useActivateUserIntegration,
  useDeactivateUser as useDeactivateUserIntegration,
  useResetPassword as useResetPasswordIntegration,
  useGrantPermissions as useGrantPermissionsIntegration,
  useRevokePermissions as useRevokePermissionsIntegration,
  useAssignRole as useAssignRoleIntegration,
  useAssignMultipleRoles as useAssignMultipleRolesIntegration,
  useReplaceUserRoles as useReplaceUserRolesIntegration,
  useRemoveRole as useRemoveRoleIntegration,
  useUpdateMyProfile as useUpdateMyProfileIntegration,
  useChangePassword as useChangePasswordIntegration,
  useUserPermissionsCheck,
  useUserRolesCheck,
  userQueryKeys,
} from './hooks/use-user-integration';

// Tenant hooks
export {
  useTenants,
  useTenant,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useCreateTenantWithAdmin,
} from './hooks/use-tenants';
