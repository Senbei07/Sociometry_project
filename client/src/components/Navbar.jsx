import { Link } from 'react-router-dom';
import '../css/Navbar.css'

function Navbar() {
    return (
        <nav className='Navbar' >
            <Link to="/" style={{ marginRight: '10px' }}>index</Link>
            <Link to="/home">home</Link>
        </nav>
    );
}

export default Navbar;
