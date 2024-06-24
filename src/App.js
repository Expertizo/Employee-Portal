import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [boards, setBoards] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [doneCards, setDoneCards] = useState([]);
  const [doneListId, setDoneListId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reopenListId, setReopenListId] = useState('');

  const TRELLO_API_KEY = process.env.REACT_APP_TRELLO_API_KEY
  const TRELLO_TOKEN = process.env.REACT_APP_TRELLO_TOKEN

  useEffect(() => {
    // Fetch boards
    axios.get(`https://api.trello.com/1/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
      .then(response => {
        setBoards(response.data);
      })
      .catch(error => console.error('Error fetching boards:', error));
  }, []);

  const handleBoardSelect = (boardId) => {
    setSelectedBoard(boardId);
    setSelectedMember('');
    setDoneListId('');
    setReopenListId('');
    setDoneCards([]);

    // Fetch members of the selected board
    axios.get(`https://api.trello.com/1/boards/${boardId}/members?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
      .then(response => {
        setMembers(response.data);
      })
      .catch(error => console.error('Error fetching members:', error));

    // Fetch lists of the selected board and identify the "Done" and "Reopen" lists
    axios.get(`https://api.trello.com/1/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
      .then(response => {
        const doneList = response.data.find(list => list.name.toLowerCase() === 'done');
        const reopenList = response.data.find(list => list.name.toLowerCase() === 'reopen');
        if (doneList) setDoneListId(doneList.id);
        if (reopenList) setReopenListId(reopenList.id);
      })
      .catch(error => console.error('Error fetching lists:', error));
  };


  const handleMemberSelect = (memberId) => {
    setSelectedMember(memberId);
    if (doneListId) {
      fetchCardCount(doneListId, memberId, startDate, endDate);
    }
  };

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    if (doneListId && selectedMember) {
      fetchCardCount(doneListId, selectedMember, start, end);
    }
  };

  const fetchCardCount = (doneListId, memberId, start, end) => {
    axios.get(`https://api.trello.com/1/lists/${doneListId}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
      .then(async (response) => {
        const cards = response.data;

        let doneCardsData = [];

        await Promise.all(cards.map(async (card) => {
          if (!card.idMembers.includes(memberId)) return
          const actionsResponse = await axios.get(`https://api.trello.com/1/cards/${card.id}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&filter=updateCard:idList`);
        const actions = actionsResponse.data;

        const moveToDoneAction = actions.find(action => action.data.listAfter.id === doneListId);
        if (moveToDoneAction) {
          const moveDate = new Date(moveToDoneAction.date);
          if ((!start || moveDate >= new Date(start)) && (!end || moveDate <= new Date(end))) {
            const memberName = memberId === 'all' ? 'All Members' : card.idMembers.find(member => member.id === memberId)?.fullName || 'Unknown Member';
            console.log('card', card)
            const cardData = {
              name: card.name,
              movedDate: moveDate.toLocaleDateString(),
              movedTime: moveDate.toLocaleTimeString(),
              member: memberName,
              link: card.shortUrl
            };

            doneCardsData.push(cardData);
          }
        }

        // Fetch reopen occurrences
        if (reopenListId) {
          const reopenActions = actions.filter(action => action.data.listAfter.id === reopenListId);
          const reopenCount = reopenActions.length;

          if (reopenCount > 0) {
            const reopenHistory = reopenActions.map(action => ({
              moveDate: new Date(action.date).toLocaleString(),
              listName: action.data.listAfter.name
            }));

            // Add reopen count and history to cardData
            const cardIndex = doneCardsData.findIndex(cardData => cardData.name === card.name);
            if (cardIndex !== -1) {
              doneCardsData[cardIndex].reopenCount = reopenCount;
              doneCardsData[cardIndex].reopenHistory = reopenHistory;
            }
          }
        }
        }));

        setDoneCards(doneCardsData);
      })
      .catch(error => console.error('Error fetching cards:', error));
  };

console.log('doneCards', doneCards)


  return (
    <div>
      <h1>Trello Dashboard</h1>
      <div>
        <label>Select Board:</label>
        <select onChange={e => handleBoardSelect(e.target.value)} value={selectedBoard}>
          <option value="">Select a board</option>
          {boards.map(board => (
            <option key={board.id} value={board.id}>{board.name}</option>
          ))}
        </select>
      </div>
      {members.length > 0 && (
        <div>
          <label>Select Member:</label>
          <select onChange={e => handleMemberSelect(e.target.value)} value={selectedMember}>
            <option value="all">All</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.fullName}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={e => handleDateChange(e.target.value, endDate)} />
      </div>
      <div>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={e => handleDateChange(startDate, e.target.value)} />
      </div>
      <div>
            <h2>Cards Moved into Done: {doneCards.length}</h2>
        <ol>
          {doneCards.map((card, index) => (
            <li key={index}>
              <a href={card.link} target="_blank"><strong>{card.name}</strong></a> - Moved to Done on {card.movedDate} at {card.movedTime}
              {card.reopenCount > 0 && (
                <span> - <b>Reopened {card.reopenCount} times</b></span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default App;