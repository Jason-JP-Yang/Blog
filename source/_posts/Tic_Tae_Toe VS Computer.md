---
title: "Python Programs: 井字棋AI Tic_Tae_Toe VS Computer"
cover: images/cover-img/Python_background_01.svg
thumbnail: images/cover-img/Python_background_01.svg
excerpt: The best python code of Tic-Tac-Toe in the world. Despite the code for enhancing the player experience, only use 65 lines can perform all its functions. The best computer logic of Tic-Tac-Toe in the world. 
date: 2024/7/24 08:00:00
updated: 2024/7/24 23:56:00
categories:
- Programming
- Python
tags: 
- 科技
- 编程
---

```
Copyright © Jason Yang 2024   All right reserved.
<Python: Tic-Tac-Toe VS Computer>
Copyright © 2024 by Jason Yang is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
```

{% btn center large::Visit Github Page::https://github.com/Jason-JP-Yang/Python-Tic_Tae_Toe/tree/main::fa-brands fa-github %}

## ***Charateristic of this CODE***
The best python code of Tic-Tac-Toe in the world** </br>
Despite the code for enhancing the player experience, only use 65 lines can perform all its functions </br>
The best computer logic of Tic-Tac-Toe in the world** </br>
The command line interface is well-designed which is user-friendly </br>
Extremely compact codes results in extremely high scalability </br>
** You can read the core logic code
**Information collected from github.com & time node 2024/4/20 & Only discuss on the logic of the codes instead of user experience
## ***CODE PROGRAMMING*** Plan of Programming
1. Write the CORE CODE
2. Modify the print() message in the CORE CODE to become more user-friendly
3. Restructre the code for Better readability and reduced iterations and wasted computing performance
4. Add some extensions that make the game more interesting and further develop the use of cli (command-line interface) - terminal
## Part I BASIC VERSION
***This version already satisfy all the functions required in both basic and challenging requirement***
1. ***Initialization of the code***
    ``` python
    import random, time
    ``` 
2. ***Game Board Initialization***
  - Set up a list record all steps in the game and record 1 - 9 respectively
    ``` python
    ## Step 1: Game Board Initialization
    TicTacToe_Table = []
    for index in range(9):
      TicTacToe_Table.append(index + 1)
    ```
  - Set up a list reacord all the valid steps for both computer and user to input and record the same information as list "TicTacToe_Table"
    - *Using ``ValidInput = list(TicTacToe_Table)`` instead of ``ValidInput = TicTacToe_Table``: In python, if we directly set a new list and equal to original list, it act like a pointer （指针） to the original list instead of assign（赋值） a new list.*
    - *Pointer: When the original list change, the pointer change correspond with the original list; pointer store nothing*
    ``` python
    # ValidInput = TicTacToe_Table
    ValidInput = list(TicTacToe_Table)
    ```
  - Set up two new empty lists record the steps of user and computer respectively
    ``` python
    UserInput = []
    ComputerInput = []
    ```
  - Better User experience
    - We use ``\033[...m`` to change the **colour** and **style** of the text print in the ter
    ``` python
    print("\033[1m╔════════════════════════════════════════════════╗")
    print("\033[1m║          Welcome to Tic Tac Toe Game!          ║")
    print("\033[1m║\033[1;32m  Let's play Tic-Tac-Toe against the computer!  \033[1;    37m║")
    print("\033[1m╚════════════════════════════════════════════════╝\n")
    
    print("\033[0m┌────────────────────────────────────────────────┐")
    print("│ \033[1mIntroduction of the game:\033[0m                      │")
    print("│ You probably already know how to play Tic-Tac- │")
    print("│ Toe. It's a really simple game, right? That's  │")
    print("│ what most people think.                        │")
    print("│                                                │")
    print("│ But if you really wrap your brain around it,   │")
    print("│ you'll discover that Tic-Tac-Toe isn't quite   │") 
    print("│ as simple as you think!                        │")
    print("│                                                │")
    print("│ \033[1mRules of the Games:\033[0m                            │")
    print("│ 1. The game is played on a grid that's 3       │")
    print("│    squares.                                    │")
    print("│ 2. \033[1;34mYou are X, \033[1;31mThe computer is ○. \033[0mPlayers    take  │")
    print("│    turns putting their marks in empty squares. │")
    print("│ 3. The first player to get 3 of her marks in a │")
    print("│    row (up, down, across, or diagonally) is    │")
    print("│    the winner.                                 │")
    print("│ 4. When all 9 squares are full, the game is    │")
    print("│    over. If no player has 3 marks in a row,    │")
    print("│    the game ends in a draw.                    │")
    print("└────────────────────────────────────────────────┘\n")
    
    print("┌────────────────────────────────────────────────┐")
    print("│ \033[1mDifficulty of the game:\033[0m                        │")
    print("│ 1. \033[1;32mNORMAL\033[0;32m: The Logic of Computer has mistakes,\033 [0m │")
    print("│    \033[0;32mit is not that hard to beat computer!\033[0m       │")
    print("│ 2. \033[1;31mEXTREME\033[0;31m: The Logic of Computer Move is\033  [0m      │")
    print("│    \033[0;31mperfect. player cannot win under this mode,\033[0m │")
    print("│    \033[0;31mplayer can try to get DRAW in the mode.\033[0m     │")
    print("└────────────────────────────────────────────────┘\n")
    ```
3. ***Set the Difficulty of the game***
- Only under the Difficulty of NORMAL, player can have chance to beat the computer
- Under the Difficulty of EXTREME, the logic of computer is perfect and user will not win under this mode forever (that can be prove by enumerate all moves)
- Let player enter the difficulty (NORMAL OR EXTREME)
  - When input Invalid choice, program will send a error handling and let player re-enter until player enter a correct choice
  - The Input will store in new variables called "Difficulty"
  - Version 1 has an invisible BUG: stack overflow: In Python, function calls are implemented as a stack, which is a data structure that takes a push operation whenever a function is called and a pop operation whenever the function returns.（在Python中，函数调用是通过栈（stack）这种数据结构实现的，每当进入一个函数调用，相当于一次push压栈操作，每当函数返回，相当于一次pop出栈操作。由于栈的大小不是无限的，所以，递归调用的次数过多，会导致栈溢出。）
    ``` python
    # Version 1: Contain Invisible BUG: stack overflow
    def EnterInput():
      Difficulty = input("Choice Difficulty of the game (\033[1;32mNORMAL\033[0m / \033[1;31mEXTREME\033[0m): ")
      if Difficulty == "NORMAL" or Difficulty == "EXTREME": Entered_ValidInput = True
      else: 
        print("\033[1;31mPlease enter a valid input! \033[0m(\033[1;32mNORMAL\033[0m / \033[1;31mEXTREME\033[0m)")
        EnterInput()
    ```
    ``` python
    # Version 2: DEBUG
    Entered_ValidInput = False
    while Entered_ValidInput is False:
      Difficulty = input("Choice Difficulty of the game (\033[1;32mNORMAL\033[0m / \033[1;31mEXTREME\033[0m): ")
      if Difficulty == "NORMAL" or Difficulty == "EXTREME": Entered_ValidInput = True
      else: print("\033[1;31mPlease enter a valid input! \033[0m(\033[1;32mNORMAL\033[0m / \033[1;31mEXTREME\033[0m)")
    ```

4. ***Setup a GAME LOOP***
  ``` python
  while True: ...
  ```
5. ***Display information***
- Display the Tic-Tac-Toe Table and the valid input
  - In version 2 (more user-friendly)
  ``` python
  # Version 1 Core coding
    ## Step 2: Game Board Display
  print(TicTacToe_Table)
    ## Step 3: Check all valid moves
  print(ValidInput)
  ```
  ``` python
  # Version 2 More User-friendly
  def DisplayGameBoard():
    global TicTacToe_Table
    print("\n┌───┬───┬───┐")
    print("│", TicTacToe_Table[0], "│", TicTacToe_Table[1], "│", TicTacToe_Table[2], "│")
    print("├───┼───┼───┤")
    print("│", TicTacToe_Table[3], "│", TicTacToe_Table[4], "│", TicTacToe_Table[5], "│")
    print("├───┼───┼───┤")
    print("│", TicTacToe_Table[6], "│", TicTacToe_Table[7], "│", TicTacToe_Table[8], "│")
    print("└───┴───┴───┘")
  
  def DisplayValidInput():
  global ValidInput
  print("Your Valid Move: ", end="")
  for index in range(len(ValidInput)):
    if index != len(ValidInput) - 1: print(str(ValidInput[index]) + ", ", end="")
    else: print(ValidInput[index])
  
    ## Step 2: Game Board Display
    DisplayGameBoard()
    ## Step 3: Check all valid moves
    DisplayValidInput()
  
    ## OUTPUT:
    ## ┌───┬───┬───┐
    ## │ 1 │ 2 │ 3 │
    ## ├───┼───┼───┤
    ## │ 4 │ 5 │ 6 │
    ## ├───┼───┼───┤
    ## │ 7 │ 8 │ 9 │
    ## └───┴───┴───┘
    ## Your Valid Move: 1, 2, 3, 4, 5, 6, 7, 8, 9
  ```
6. ***Player Take Move***
- Wait Player input a valid move, code in the same logic with entering the Difficulty
  - When input Invalid choice, program will send a error handling and let player re-enter until player enter a correct choice
  ``` python
  Entered_ValidInput = False
  while Entered_ValidInput == False:
    UserMove = input("\033[0mTake your move: ")
    if not UserMove.isdigit():
      print("\033[1;31mPlease enter a valid input! You should only enter number instead of other characters. The number represent the the move that is available in the table! ", end = "")
      DisplayValidInput()
    elif int(UserMove) not in ValidInput:
      print("\033[1;31mPlease enter a valid input! You should only take the move that is available in the table! ", end = "")
      DisplayValidInput()
    else: Entered_ValidInput = True
  ```
- Processing the input of Player
  - Set the number in Tic-Tae-Toe Table become "X"
  - Remove this move from the list ValidInput and add it into the list of UserInput
  ``` python
  TicTacToe_Table[int(UserMove) - 1] = "X"
  ValidInput.remove(int(UserMove))
  UserInput.append(int(UserMove))
  ```
- Check the Player Win and Draw condition
  - First setup a dictionary recorded all win condition
  - If there is no more valid move => the length of ValidInput == 0, then display the game board, send the message of DRAW!!! and exit the program.
  - Set a loop check through all possible winning condition in the Dict_WinCondition list.
  ``` python
  Dict_WinCondition = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],\
                         [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]]
  for index in range(len(Dict_WinCondition)):
  if len([x for x in UserInput if x in Dict_WinCondition[index]]) == 3:
    DisplayGameBoard()
    print("YOU WIN!!!")
    exit()
    
  ## Expand form of the if condition:
  list = []
  for x in UserInput:
    if x in Dict_WinCondition[index]:
      list.append(x)
  if len(list) == 3: ...
  ```
7. ***Computer Take Move***
- Set a function for computer to take move and check the Computer Win condition
  - Set the number in Tic-Tae-Toe Table become "○"
  - Remove this move from the list ValidInput and add it into the list of ComputerInput
  ``` python
  def ComputerMove(number):
    TicTacToe_Table[number - 1] = "○"
    ValidInput.remove(number)
    ComputerInput.append(number)
  ```
  - Set a loop check through all possible winning condition in the Dict_WinCondition list.
  ``` python
  for index in range(len(Dict_WinCondition)):
  if len([x for x in ComputerInput if x in Dict_WinCondition[index]]) == 3:
    DisplayGameBoard()
    print("COMPUTER WIN!!!")
    exit()
  ```
- Logic of Computer Move
  - Explanation of Perfect Logic (Difficulty == EXTREME) </br>
    ***The following part solve the easiest part of the logic***
    - When it is the first step of computer and user did not take the move of 5, computer must take move of 5
    ``` python
    if len(ValidInput) == 8 and 5 in ValidInput: ComputerMove(5)
    ```
    - When it is the first step of computer and user took the move of 5, computer will take move in random choice of 1, 3, 7, 9 (The four corner of the table)
    ``` python
    elif len(ValidInput) == 8 and 5 not in ValidInput: ComputerMove(random.choice([1, 3, 7, 9]))
    ```
    ***The following part solve the difficult condition of the logic***
    - Set a new Variable Moved_TF with type of Boole and initialize it to False, it use to check whether the logic find a perfect move, if the move is founded, the subsequent codes will and back to the start fo the GameLoop (continue)
    ``` python
    Moved_TF = False   ...
    if Moved_TF == True: continue
    ```
    - Set a loop check through the number of both UserInput and ComputerInput all winning condition in the Dict_WinCondition list.
      - If that number of UserInput and ComputerInput equal to 0 and 2 respectively, computer move in last space and it will win
      ``` python
      for index in range(len(Dict_WinCondition)):
        if [len([x for x in UserInput if x in Dict_WinCondition[index]]),
            len([x for x in ComputerInput if x in Dict_WinCondition[index]])] == [0, 2]:
          Moved_TF = True
          ComputerMove([x for x in Dict_WinCondition[index] if x not in ComputerInput][0])
          break
      ```
      - If that number of UserInput and ComputerInput equal to 2 and 0 respectively, computer move in last space and it can block player to win
      ``` python
      for index in range(len(Dict_WinCondition)):
        if [len([x for x in UserInput if x in Dict_WinCondition[index]]),
            len([x for x in ComputerInput if x in Dict_WinCondition[index]])] == [2, 0]:
          Moved_TF = True
          ComputerMove([x for x in Dict_WinCondition[index] if x not in UserInput][0])
          break
      ```
      - Finally, if still cannot find a perfect move, computer will random choice a move
  - Modification: Make the logic for the difficulty of NORMAL
    - Computer will not take the step of 1, 3, 5, 7, 9 as its first move
  - Modification: Improvement of the Logic
    - ***Final Version: Best Logic and using the least CPU computing power*** </br>
      ***It only contain 13 lines but can perform in a perfect logic and under EXTREME mode the user will not win forever*** (**The codes of performing logic of NORMAL mode is not included in the "13 lines")
    ``` python
    if len(ValidInput) == 8 and Difficulty == "NORMAL": ComputerMove(random.choice([x for x in [2, 4, 6, 8] if x not in UserInput]))
    elif len(ValidInput) == 8 and 5 in ValidInput and Difficulty == "EXTREME": ComputerMove(5)
    elif len(ValidInput) == 8 and 5 not in ValidInput and Difficulty == "EXTREME": ComputerMove(random.choice([1, 3, 7, 9]))
    else:  
      for index in range(8):
        CheckList = [len([x for x in UserInput if x in Dict_WinCondition[index]]),
                     len([x for x in ComputerInput if x in Dict_WinCondition[index]])]
        PriorityMove = [x for x in Dict_WinCondition[index] if x not in ComputerInput and x not in [1, 3, 7, 9]]
        if CheckList == [0, 2]:
          ComputerMove([x for x in Dict_WinCondition[index] if x not in ComputerInput][0])
          break
        elif CheckList == [2, 0]:
          ComputerMove([x for x in Dict_WinCondition[index] if x not in UserInput][0])
          break
        elif CheckList == [0, 1] and PriorityMove:
          ComputerMove(random.choice(PriorityMove))
          break
        elif index == 7: ComputerMove(random.choice(ValidInput))
    ```
    - ***Version 1: NO BUG with normal readability***
    ``` python
    if len(ValidInput) == 8 and 5 in ValidInput and Difficulty == "EXTREME":
      ComputerMove(5)
    elif len(ValidInput) == 8 and 5 not in ValidInput:
      if Difficulty == "NORMAL":
        ComputerMove(random.choice([2, 4, 6, 8]))
      elif Difficulty == "EXTREME":
        ComputerMove(random.choice([1, 3, 7, 9]))
    else:
      Moved_TF = False
      for index in range(len(Dict_WinCondition)):
        if [len([x for x in UserInput if x in Dict_WinCondition[index]]),
            len([x for x in ComputerInput if x in Dict_WinCondition[index]])] == [0, 2]:
          Moved_TF = True
          ComputerMove([x for x in Dict_WinCondition[index] if x not in ComputerInput][0])
          break
      if Moved_TF == True: continue
      for index in range(len(Dict_WinCondition)):
        if [len([x for x in UserInput if x in Dict_WinCondition[index]]),
            len([x for x in ComputerInput if x in Dict_WinCondition[index]])] == [2, 0]:
          Moved_TF = True
          ComputerMove([x for x in Dict_WinCondition[index] if x not in UserInput][0])
          break
      if Moved_TF == True: continue
      for index in range(len(Dict_WinCondition)):
        if [len([x for x in UserInput if x in Dict_WinCondition[index]]),
            len([x for x in ComputerInput if x in Dict_WinCondition[index]])] == [0, 1]:
          ValidMove = [x for x in Dict_WinCondition[index] if x not in ComputerInput]
          if len(ValidMove) == 1: ComputerMove(ValidMove[0])
          else: ComputerMove(ValidMove[random.choice([0, 1])])
          Moved_TF = True
          break
      if Moved_TF == True: continue
      ComputerMove(random.choice(ValidInput))
    ```
    - ***Beta Version: With some BUG and poor readability***
    ``` python
    ## Beta Version
    for index in range(len(Dict_WinMove)):
      match_winmove = 0
      for index_s in range(0, 3):
        if Dict_WinMove[index][index_s] not in ValidInput and TicTacToe_Table[Dict_WinMove[index][index_s] - 1] == "X":
          match_winmove += 1
      print(index, match_winmove)
      if match_winmove == 2:
        print(True)
        for index_s in range(0, 3):
          if Dict_WinMove[index][index_s] in ValidInput:
            TicTacToe_Table[Dict_WinMove[index][index_s] - 1] = "O"
            solve = True
            break
          else: solve = False
      if solve == True: break
    if solve = false
    ```