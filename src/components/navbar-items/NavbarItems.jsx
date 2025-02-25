import { Link, useNavigate, useLocation } from 'react-router-dom';
import DropdownButton from '../ux/toast/DropdownButton';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * A component that renders the navigation items for the navbar for both mobile/desktop view.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} props.isAuthenticated - A flag indicating whether the user is authenticated.
 * @param {Function} props.onHamburgerMenuToggle
 */
const NavbarItems = ({ isAuthenticated, onHamburgerMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handles the logout action (temporary logic without API)
   */
  const handleLogout = async () => {
    console.log('User logged out (simulated)');
    navigate('/login');
  };

  const dropdownOptions = [
    { name: 'Profile', onClick: () => navigate('/user-profile') },
    { name: 'Logout', onClick: handleLogout },
  ];

  /**
   * Determines if a given path is the current active path.
   *
   * @param {string} path - The path to check.
   * @returns {boolean} - True if the path is active, false otherwise.
   */
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-brand">
        <Link
          to="/"
          className={`uppercase font-medium text-slate-100 hover-underline-animation ${
            isActive('/') && 'active-link'
          }`}
          onClick={onHamburgerMenuToggle}
        >
          Home
        </Link>
      </li>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-brand">
        <Link
          to="/hotels"
          className={`uppercase font-medium text-slate-100 hover-underline-animation ${
            isActive('/hotels') && 'active-link'
          }`}
          onClick={onHamburgerMenuToggle}
        >
          Hotels
        </Link>
      </li>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-brand">
        <Link
          to="/about-us"
          className={`uppercase font-medium text-slate-100 hover-underline-animation ${
            isActive('/about-us') && 'active-link'
          }`}
          onClick={onHamburgerMenuToggle}
        >
          About us
        </Link>
      </li>
      <li className={`${!isAuthenticated && 'p-4 hover:bg-blue-900 md:hover:bg-brand'}`}>
        {isAuthenticated ? (
          <DropdownButton triggerType="click" options={dropdownOptions} />
        ) : (
          <Link
            to="/login"
            className={`uppercase font-medium text-slate-100 hover-underline-animation ${
              isActive('/login') && 'active-link'
            }`}
            onClick={onHamburgerMenuToggle}
          >
            Login/Register
          </Link>
        )}
      </li>
    </>
  );
};

export default NavbarItems;
