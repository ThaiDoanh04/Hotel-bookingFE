import { Link, useNavigate, useLocation } from 'react-router-dom';
import DropdownButton from '../ux/toast/DropdownButton';
import { authService } from '../../service/authService';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHotel, faSignInAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * A component that renders the navigation items for the navbar for both mobile/desktop view.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} props.isAuthenticated - A flag indicating whether the user is authenticated.
 * @param {Function} props.onHamburgerMenuToggle - Function to toggle the hamburger menu.
 */
const NavbarItems = ({ isAuthenticated, onHamburgerMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerAuthCheck } = useContext(AuthContext);

  /**
   * Handles the logout action by calling the logout API and updating the authentication state.
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
      triggerAuthCheck();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const dropdownOptions = [
    { 
      name: 'Hồ sơ của tôi', 
      onClick: () => navigate('/user-profile'),
      icon: <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
    },
    { 
      name: 'Đăng xuất', 
      onClick: handleLogout,
      className: 'text-red-500'
    },
  ];

  /**
   * Determines if a given path is the current active path.
   *
   * @param {string} path - The path to check.
   * @returns {boolean} - True if the path is active, false otherwise.
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-brand transition-colors duration-200">
        <Link
          to="/"
          className={`uppercase font-medium text-slate-100 hover-underline-animation flex items-center gap-2 ${
            isActive('/') ? 'active-link' : ''
          }`}
          onClick={onHamburgerMenuToggle}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Trang chủ</span>
        </Link>
      </li>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-brand transition-colors duration-200">
        <Link
          to="/hotels"
          className={`uppercase font-medium text-slate-100 hover-underline-animation flex items-center gap-2 ${
            isActive('/hotels') ? 'active-link' : ''
          }`}
          onClick={onHamburgerMenuToggle}
        >
          <FontAwesomeIcon icon={faHotel} />
          <span>Khách sạn</span>
        </Link>
      </li>
      <li
        className={`${!isAuthenticated ? 'p-4 hover:bg-blue-900 md:hover:bg-brand transition-colors duration-200' : ''}`}
      >
        {isAuthenticated ? (
          <DropdownButton triggerType="click" options={dropdownOptions} />
        ) : (
          <Link
            to="/login"
            className={`uppercase font-medium text-slate-100 hover-underline-animation flex items-center gap-2 ${
              isActive('/login') ? 'active-link' : ''
            }`}
            onClick={onHamburgerMenuToggle}
          >
            <FontAwesomeIcon icon={faSignInAlt} />
            <span>Đăng nhập/Đăng ký</span>
          </Link>
        )}
      </li>
    </>
  );
};

export default NavbarItems;