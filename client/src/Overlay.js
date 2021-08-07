import { BsFillInfoCircleFill } from 'react-icons/bs';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import React from 'react';

function Over(props) {
    return (
        <div className="text-right">
            <h6>
                <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip id="button-tooltip" >
                        {props.value}
                    </Tooltip>}
                >
                    <BsFillInfoCircleFill />
                </OverlayTrigger>
            </h6>
        </div>
    );

}

function Overlay(props) {
    return <Over value={props.value} />
}

export { Overlay }