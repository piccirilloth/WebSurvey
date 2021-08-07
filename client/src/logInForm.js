import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

function LogInForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [valid, setValid] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        let flag = true;
        const credentials = { username, password };
        setValid('');
        if (username === '' || password === '' || password.length < 8)
            flag = false;
        if (flag)
            props.logIn(credentials);
        else
            setValid("There are errors, fix them");
    }

    return (
        <>
            <Container fluid="sm" className='d-flex flex-column h-100'>
                <Form>
                    {valid ? <Alert variant="danger">{valid}</Alert> : ''}
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                    </Form.Group>
                    <Button onClick={handleSubmit} color="success">LogIn</Button> <Link to="/"><Button variant="light" onClick={() => props.setMessage('')}>Cancel</Button></Link>
                </Form>
            </Container>
        </>
    );
}

export { LogInForm };