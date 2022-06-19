import { gql, useQuery } from "@apollo/client";
import { Divider } from "@material-ui/core";
import ContactList from '../../../components/ContactList';
import { useRecoilState } from 'recoil';
import { selectedUserState } from "../../../recoil";
import { useAuth0 } from "@auth0/auth0-react";

const GET_USER = gql`
  query MyQuery(
    $order_by: [users_order_by!] = { name: desc }
    $_neq: String = ""
  ) {
    users(order_by: $order_by, where: { id: { _neq: $_neq } }) {
      id
      name
      picture
    }
  }
`;

const Contact = () => {
  const { user } = useAuth0()
  const { data } = useQuery(GET_USER, {
    variables: { order_by: { name: 'asc' }, _neq: user.sub }
  })

  const setSelectedUser = useRecoilState(selectedUserState)[1]
  const users = [{ id: null, name: 'LOBI' }]

  if (data && data.users) {
    users.push(...data.users)
  }

  return (
    <div>
      {users.map(u => {
        return (
          <div key={String(u.id)} onClick={() => setSelectedUser(u)}>
            <ContactList user={u} />
            <Divider />
          </div>
        )
      })}
    </div>
  )
}

export default Contact