import MemberList from '@/components/ui/List/MemberList';
import { type Member } from '@/lib/services/superAdminService';

const MEMBER_LIST_SIZES = [
  { size: 'lg', className: 'hidden lg:flex' },
  { size: 'md', className: 'hidden md:flex lg:hidden' },
  { size: 'sm', className: 'flex md:hidden' },
] as const;

type MemberTableProps = {
  members: Member[];
  isLoading: boolean;
  onChangeRole: (member: Member) => void;
  onWithdraw: (member: Member) => void;
};

export default function MemberTable({
  members,
  isLoading,
  onChangeRole,
  onWithdraw,
}: MemberTableProps) {
  return (
    <div className="flex flex-col">
      <div className="hidden gap-20 border-y border-primary-100 px-5 py-5 lg:flex">
        <p className="text-16-bold w-[142px] text-primary-500">이름</p>
        <p className="text-16-bold flex-1 text-primary-500">메일</p>
        <p className="text-16-bold w-[72px] text-center text-primary-500">
          권한
        </p>
        <p className="text-16-bold w-[200px] text-center text-primary-500">
          비고
        </p>
      </div>

      {members.map((member) => (
        <div key={member.id}>
          {MEMBER_LIST_SIZES.map(({ size, className }) => (
            <MemberList
              key={size}
              name={member.name}
              email={member.email}
              authority={member.role}
              onChangeRole={() => onChangeRole(member)}
              onWithdraw={() => onWithdraw(member)}
              size={size}
              className={className}
            />
          ))}
        </div>
      ))}

      {!isLoading && members.length === 0 ? (
        <p className="text-16-regular py-10 text-center text-primary-500">
          회원이 없습니다.
        </p>
      ) : null}
    </div>
  );
}
