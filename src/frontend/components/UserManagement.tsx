import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HansProTable } from '@/frontend/components/ui/HansProTable/index';
import type { ColumnDef } from '@tanstack/react-table';
import { hansRequest } from '@/common/hansRequest';
import { toast } from 'sonner';
import { Button } from '@/frontend/components/ui/button';
import { useJwtTokenStore } from '@/frontend/stores/useJwtTokenStore';
import { errorToStr } from '@/common/errorToStr';
import { IsAdminResponse, UserListRow } from '@/types/auth';
import { SearchFieldProps } from './ui/HansProTable/ProTableSearchFields';
import { Helmet } from 'react-helmet-async';

export default function UserManagement() {
  const [users, setUsers] = React.useState<UserListRow[]>([]);
  const navigate = useNavigate();
  const { jwtToken } = useJwtTokenStore();

  React.useEffect(() => {
    if (!jwtToken) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await hansRequest.getWithAuthorization<IsAdminResponse>('/api/user/isAdmin', jwtToken);
        if (!response.isAdmin) {
          toast.error('只有管理员才能注册用户');
          navigate('/');
        }
      } catch (error) {
        toast.error(errorToStr(error));
        navigate('/');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await hansRequest.getWithAuthorization<UserListRow[]>('/api/user/all', jwtToken);
        setUsers(response);
      } catch (error) {
        toast.error(`获取用户列表失败: ${errorToStr(error)}`);
      }
    };

    (async () => {
      await checkAdmin();
      await fetchUsers();
    })();

  }, [jwtToken, navigate]);

  const tableSearchFields: SearchFieldProps[] = [
    { key: 'uid', label: '用户ID', type: 'input', clearable: true },
    { key: 'uname', label: '用户名', type: 'input', clearable: true },
    {
      key: 'isAdmin',
      label: '角色',
      type: 'select',
      clearable: true,
      options: [{ label: '管理员', value: true }, { label: '普通用户', value: false }],
    },
    { key: 'personalizedSign', label: '个性签名', type: 'input', clearable: true },
  ];

  const columns: ColumnDef<UserListRow>[] = [
    {
      accessorKey: 'uid',
      header: '用户ID',
    },
    {
      accessorKey: 'uname',
      header: '用户名',
    },
    {
      accessorKey: 'isAdmin',
      header: '角色',
      cell: ({ row }) => (row.getValue('isAdmin') ? '管理员' : '普通用户'),
    },
    {
      accessorKey: 'personalizedSign',
      header: '个性签名',
      cell: ({ row }) => row.getValue('personalizedSign') || '-',
    },
    {
      id: 'actions',
      header: '操作',
      cell: () => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: 编辑用户
              }}
            >
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: 删除用户
              }}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>用户管理</title>
      </Helmet>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">用户管理</h1>
        </div>
        <HansProTable
          columns={columns}
          data={users}
          searchFields={tableSearchFields}
        />
      </div>
    </>
  );
}
