import { FC, HTMLAttributes } from 'react';
import { Card } from '@/components/ui/card';

interface Role {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface RolesSectionProps extends HTMLAttributes<HTMLDivElement> {
  roles: Role[];
}

const RolesSection: FC<RolesSectionProps> = ({ roles, ...props }) => {
  return (
    <Card className="p-6" {...props}>
      <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: role.color }}
              />
              <span className="text-sm font-medium">{role.name}</span>
            </div>
            <span className="text-sm text-gray-500">{role.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RolesSection; 