// import { Navbar } from './_components/navbar'
// import Sidebar from './_components/sidebar'

// const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <div className="h-full">
//       <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56">
//         <Navbar />
//       </div>
//       <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
//         <Sidebar />
//       </div>
//       <main className="h-full pt-[80px] md:pl-56">{children}</main>
//     </div>
//   )
// }

// export default DashboardLayout
// app/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isTeacher } from '@/lib/teacher';

import { Navbar } from './_components/navbar';
import Sidebar from './_components/sidebar';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  // Redirect if not logged in
  if (!userId) {
    return redirect('/');
  }

  // Optional: You can pass the 'isTeacher' status down to the sidebar 
  // if you want to restrict the "Teacher Mode" toggle button itself.
  const teacherStatus = isTeacher(userId);

  return (
    <div className="h-full">
      {/* Top Navbar */}
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56">
        <Navbar isTeacher={teacherStatus} />
      </div>

      {/* Sidebar - Desktop */}
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
        <Sidebar isTeacher={teacherStatus} />
      </div>

      {/* Content Area */}
      <main className="h-full pt-[80px] md:pl-56">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;