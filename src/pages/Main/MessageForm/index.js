import { gql, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { makeStyles, TextField } from "@material-ui/core"
import { useState } from "react";
import { selectedUserState } from '../../../recoil';
import { useRecoilState } from 'recoil';

const INSERT_MESSAGE = gql`
  mutation MyMutation($fromUserId: String = "", $message: String = "", $toUserId: String = "") {
    insert_messages_one(object: {message: $message, fromUserId: $fromUserId, toUserId: $toUserId}) {
      id
    }
  }
`
const useStyles = makeStyles((theme) => ({
  messageForm: {
    overflow: "hidden",
    margin: "20px",
    padding: "0",
  },
}));

const MessageForm = () => {
  const classes = useStyles()
  const { user } = useAuth0()
  const [message, setMessage] = useState('')
  const [selectedUser] = useRecoilState(selectedUserState)

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    variables: {
      fromUserId: user?.sub,
      message,
      toUserId: selectedUser?.id
    }
  })

  const hangleSubmit = (e) => {
    e.preventDefault()
    insertMessage()
    setMessage('')
  }

  return (
    <form className={classes.messageForm} noValidate autoComplete="off" onSubmit={hangleSubmit}>
      <TextField
        id="input-message"
        variant="outlined"
        placeholder="type your message..."
        fullWidth={true}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ background: "#fff" }}
      />
    </form>
  )
}

export default MessageForm