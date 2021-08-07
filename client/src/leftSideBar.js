/* React imports */
import { Link } from 'react-router-dom';

/* Bootstrap imports */
import { Button, Card } from 'react-bootstrap';

function LeftSidebar(props) {

    return (
        <Card className="text-center cards" border="info" text="black">
            {props.surveys ? props.surveys.map(survey => (
                <div key={survey.id}>
                    <Card.Header>Survey</Card.Header>
                    <Card.Body>
                        <Card.Title>{survey.title}</Card.Title>
                        <Card.Text>
                            {props.loggedIn ? <>Survey compiled {survey.n_ans} times!</> : <>Compile this survey!</>}
                        </Card.Text>
                        <Link to={props.loggedIn === false ? `/survey/${survey.id}` : `/responses/${survey.id}`} ><Button variant="dark">View</Button></Link>
                        <Card.Footer>{survey.username}</Card.Footer>
                    </Card.Body>
                </div>
            )) : ''}
        </Card>
    );
}

export { LeftSidebar };