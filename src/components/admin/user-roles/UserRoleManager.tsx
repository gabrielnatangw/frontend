import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import {
  Search,
  User as UserIcon,
  Shield,
  Plus,
  X,
  CheckCircle2,
  Users,
  Settings,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import RoleSelector from '../roles/RoleSelector';
import type { User } from '../../../types/user';
import type { Role } from '../../../types/role';
import type { UserRole } from '../../../types/user-role';

interface UserRoleManagerProps {
  users: User[];
  roles: Role[];
  userRoles: UserRole[];
  onAssignRole: (userId: string, roleId: string) => void;
  onUnassignRole: (userRoleId: string) => void;
  onAssignMultipleRoles: (userId: string, roleIds: string[]) => void;
  onUnassignMultipleRoles: (userRoleIds: string[]) => void;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  readOnly?: boolean;
}

export function UserRoleManager({
  users,
  roles,
  userRoles,
  onAssignRole: _onAssignRole,
  onUnassignRole,
  onAssignMultipleRoles,
  onUnassignMultipleRoles: _onUnassignMultipleRoles,
  className = '',
  showSearch = true,
  showFilters = true,
  readOnly = false,
}: UserRoleManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [, setIsAssignDialogOpen] = useState(false);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    return users.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Obter roles de um usuário
  const getUserRoles = (userId: string) => {
    return userRoles
      .filter(userRole => userRole.userId === userId && userRole.isActive)
      .map(userRole => roles.find(role => role.id === userRole.roleId))
      .filter(Boolean) as Role[];
  };

  // Obter roles disponíveis para um usuário (não atribuídos)
  const getAvailableRoles = (userId: string) => {
    const userRoleIds = getUserRoles(userId).map(role => role.id);
    return roles.filter(role => !userRoleIds.includes(role.id));
  };

  // Contar usuários por role
  const getRoleUserCount = (roleId: string) => {
    return userRoles.filter(
      userRole => userRole.roleId === roleId && userRole.isActive
    ).length;
  };

  const handleUnassignRole = (userRoleId: string) => {
    onUnassignRole(userRoleId);
  };

  const handleOpenAssignDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles([]);
    setIsAssignDialogOpen(true);
  };

  const handleAssignMultipleRoles = () => {
    if (selectedUser && selectedRoles.length > 0) {
      onAssignMultipleRoles(selectedUser.id, selectedRoles);
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUser) {
      const availableRoles = getAvailableRoles(selectedUser.id);
      setSelectedRoles(availableRoles.map(role => role.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedRoles([]);
  };

  const handleRemoveRole = (roleId: string) => {
    setSelectedRoles(prev => prev.filter(id => id !== roleId));
  };

  const getUserInitials = (name: string): string => {
    if (!name) return '??';

    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Se só tem uma palavra, pega as duas primeiras letras
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Se tem múltiplas palavras, pega a primeira letra de cada palavra (máximo 2)
      return words
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'root':
        return 'bg-amber-100 text-amber-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Users className='w-6 h-6 text-primary' />
          <h2 className='text-xl font-semibold'>Gerenciar Roles de Usuários</h2>
          <Badge variant='outline' className='ml-2'>
            {users.length} usuários
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className='flex flex-col sm:flex-row gap-4'>
          {showSearch && (
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Buscar usuários...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          )}
        </div>
      )}

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserIcon className='w-5 h-5' />
            Usuários e seus Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo de Usuário</TableHead>
                <TableHead>Roles Atribuídos</TableHead>
                <TableHead className='text-right'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const userRolesData = getUserRoles(user.id);
                const availableRoles = getAvailableRoles(user.id);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src='' />
                          <AvatarFallback className='text-xs bg-blue-100 text-blue-800 font-semibold'>
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium text-sm'>{user.name}</div>
                          <div className='text-xs text-gray-500'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant='outline'
                        className={getUserTypeColor(user.userType || 'user')}
                      >
                        {user.userType === 'ADMIN'
                          ? 'Administrador'
                          : 'Usuário'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {userRolesData.length > 0 ? (
                          userRolesData.map(role => (
                            <Badge
                              key={role.id}
                              variant='secondary'
                              className='text-xs flex items-center gap-1'
                            >
                              <Shield className='w-3 h-3' />
                              {role.name}
                              {!readOnly && (
                                <Button
                                  variant='text'
                                  size='sm'
                                  className='h-4 w-4 p-0 hover:bg-transparent'
                                  onClick={() => {
                                    const userRole = userRoles.find(
                                      ur =>
                                        ur.userId === user.id &&
                                        ur.roleId === role.id
                                    );
                                    if (userRole) {
                                      handleUnassignRole(userRole.id);
                                    }
                                  }}
                                >
                                  <X className='w-3 h-3' />
                                </Button>
                              )}
                            </Badge>
                          ))
                        ) : (
                          <span className='text-xs text-gray-500'>
                            Nenhum role atribuído
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className='text-right'>
                      {!readOnly && availableRoles.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleOpenAssignDialog(user)}
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Atribuir Roles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                              <DialogTitle className='flex items-center gap-2'>
                                <UserIcon className='w-5 h-5' />
                                Atribuir Roles para {user.name}
                              </DialogTitle>
                              <DialogDescription>
                                Selecione os roles que deseja atribuir a este
                                usuário.
                              </DialogDescription>
                            </DialogHeader>

                            <div className='space-y-4'>
                              <RoleSelector
                                roles={availableRoles}
                                selectedRoles={selectedRoles}
                                onRoleToggle={handleRoleToggle}
                                onSelectAll={handleSelectAll}
                                onDeselectAll={handleDeselectAll}
                                onRemoveRole={handleRemoveRole}
                                placeholder='Selecionar roles para atribuir...'
                                multiple={true}
                                showStats={true}
                              />
                            </div>

                            <DialogFooter>
                              <Button
                                variant='outline'
                                onClick={() => setIsAssignDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleAssignMultipleRoles}
                                disabled={selectedRoles.length === 0}
                              >
                                <CheckCircle2 className='w-4 h-4 mr-1' />
                                Atribuir {selectedRoles.length} Role
                                {selectedRoles.length !== 1 ? 's' : ''}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumo de roles */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='w-5 h-5' />
            Resumo de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {roles.map(role => {
              const userCount = getRoleUserCount(role.id);
              return (
                <div
                  key={role.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-2'>
                    <Shield className='w-4 h-4 text-gray-500' />
                    <div>
                      <div className='font-medium text-sm'>{role.name}</div>
                      <div className='text-xs text-gray-500'>
                        {userCount} usuário{userCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {userCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserRoleManager;
