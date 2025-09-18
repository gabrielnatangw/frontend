import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Edit,
  Trash2,
  Copy,
  Users,
  Shield,
  MoreVertical,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Role } from '../../../types/role';

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onViewPermissions?: (role: Role) => void;
  onViewUsers?: (role: Role) => void;
  className?: string;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPermissions,
  onViewUsers,
  className = '',
}: RoleCardProps) {
  const isSystemRole = role.isSystem;
  const isActive = role.isActive;

  const handleEdit = () => {
    if (onEdit) onEdit(role);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(role);
  };

  const handleDuplicate = () => {
    if (onDuplicate) onDuplicate(role);
  };

  const handleViewPermissions = () => {
    if (onViewPermissions) onViewPermissions(role);
  };

  const handleViewUsers = () => {
    if (onViewUsers) onViewUsers(role);
  };

  return (
    <Card
      className={`group hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-lg bg-primary/10'>
              <Shield className='w-5 h-5 text-primary' />
            </div>
            <div>
              <CardTitle className='text-lg font-semibold text-gray-900'>
                {role.name}
              </CardTitle>
              <p className='text-sm text-gray-500 mt-1'>
                {role.description || 'Sem descrição'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='text' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className='w-4 h-4 mr-2' />
                Editar Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewPermissions}>
                <Settings className='w-4 h-4 mr-2' />
                Gerenciar Permissões
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewUsers}>
                <Users className='w-4 h-4 mr-2' />
                Ver Usuários
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className='w-4 h-4 mr-2' />
                Duplicar Role
              </DropdownMenuItem>
              {!isSystemRole && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className='text-red-600 focus:text-red-600'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Deletar Role
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-3'>
          {/* Status e Badges */}
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isActive ? 'bg-green-100 text-green-800' : ''}
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </Badge>

            {isSystemRole && (
              <Badge
                variant='outline'
                className='border-blue-200 text-blue-700'
              >
                Sistema
              </Badge>
            )}

            <Badge variant='outline' className='border-gray-200 text-gray-600'>
              {role.permissions?.length || 0} permissões
            </Badge>
          </div>

          {/* Estatísticas */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4 text-gray-400' />
              <span className='text-gray-600'>
                {role.userCount || 0} usuários
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Shield className='w-4 h-4 text-gray-400' />
              <span className='text-gray-600'>
                {role.permissions?.length || 0} permissões
              </span>
            </div>
          </div>

          {/* Data de criação */}
          <div className='text-xs text-gray-500 pt-2 border-t'>
            Criado em {new Date(role.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleCard;
