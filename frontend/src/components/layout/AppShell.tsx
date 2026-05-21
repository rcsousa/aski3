import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  SkipToContent,
  Content,
} from '@carbon/react';
import { Dashboard, Logout, Education } from '@carbon/icons-react';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <Header aria-label="Semântica para Agentes de IA">
        <SkipToContent />
        <HeaderName
          href="#"
          prefix="IBM"
          onClick={(e) => {
            e.preventDefault();
            navigate('/courses');
          }}
        >
          Semântica para Agentes IA
        </HeaderName>
        <HeaderNavigation aria-label="Navegação principal">
          <HeaderMenuItem
            isActive={isActive('/courses')}
            onClick={() => navigate('/courses')}
          >
            Cursos
          </HeaderMenuItem>
          <HeaderMenuItem
            isActive={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Dashboard"
            tooltipAlignment="end"
            onClick={() => navigate('/dashboard')}
          >
            <Dashboard size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label={`Usuário: ${user?.full_name ?? ''}`}
            tooltipAlignment="end"
            onClick={() => navigate('/dashboard')}
          >
            <Education size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="Sair"
            tooltipAlignment="end"
            onClick={handleLogout}
          >
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav
        aria-label="Módulos do curso"
        isFixedNav
        expanded={isSideNavExpanded}
        onSideNavBlur={() => setIsSideNavExpanded(false)}
      >
        <SideNavItems>
          <SideNavLink
            renderIcon={Dashboard}
            href="#"
            isActive={location.pathname === '/dashboard'}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            Dashboard
          </SideNavLink>

          {courses.map((course) => (
            <SideNavMenu
              key={course.id}
              title={course.title}
              defaultExpanded={isActive(`/courses/${course.slug}`)}
            >
              {course.sections?.map((section) => (
                <SideNavMenuItem
                  key={section.id}
                  isActive={location.pathname === `/learn/${section.id}`}
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    navigate(`/learn/${section.id}`);
                  }}
                >
                  {section.title}
                </SideNavMenuItem>
              ))}
            </SideNavMenu>
          ))}
        </SideNavItems>
      </SideNav>

      <Content className="app-content app-content--with-sidenav">
        {children}
      </Content>
    </>
  );
}
