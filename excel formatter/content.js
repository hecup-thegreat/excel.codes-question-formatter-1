(function() {
  let canvas = document.querySelector('.docs-texteventtarget-iframe').contentDocument.documentElement

  function splitter(value) {
      if (value == 'Feedback') {
          return Array.from(canvas.querySelectorAll('p')).filter(pa => pa.innerText.includes(value))
      } else if (value == 'Batches') {
          return Array.from(canvas.querySelectorAll('p')).filter(pa => pa.innerText.includes(value)).map(e => e.innerText.split(value)[1].replace(':', '').replace(' ', ''))
      }
      else {
          return Array.from(canvas.querySelectorAll('p')).filter(pa => pa.innerText.includes(value)).map(e => e.innerText.split(value)[1].replace(/^[^a-zA-Z]*/, ''))
      }
  }

  function stringy(params) {
      params.forEach(e => {
          e.batches = JSON.stringify(e.batches)
          e.choices = JSON.stringify(e.choices)
          e.feedback_images = JSON.stringify(e.feedback_images)
          e.attachments = JSON.stringify(e.attachments)
      })
      return params
  }


  let output = []

  let sourke;

  let questions = canvas.querySelectorAll('[aria-level="1"]')
  let choices = [...new Set([...canvas.querySelectorAll('[aria-level="2"]')].map(e => e.parentElement))]
  let ogQ = splitter('original_question')
  let ogA = splitter('original_answer')
  let tags = splitter('Tag')
  let batches = splitter('Batches').map(e=> e.split(', '))
  let feedbacks = splitter('Feedback')

  // let parentCheck = [questions, choices, ogQ, ogA, tags].map(arr => ({
  //     type: `questions/choices/ogQ/ogA`,
  //     html: arr,
  //     length: arr.length
  // }))
  let arrays = {
      ogQ: ogQ,
      questions: questions,
      choices: choices,
      ogA: ogA,
      tags: tags,
      batches: batches,
      feedbacks: feedbacks,
  };

  // Map through the arrays object and create the desired structure
  let parentCheck = Object.entries(arrays).map(([name, arr]) => ({
      type: name,   // This will use the key from the object, which is the variable name as a string
      html: arr,
      length: arr.length
  }));

  let lengthCheck = parentCheck.map(arr => arr.length)

  if (parentCheck.filter(e => e.type == 'ogQ' || e.type == 'ogA' || e.type == 'tags' || e.type == 'batches').map(e => e.length).every(e => e == 0)) {
      let otherCheck = parentCheck.filter(e => e.type == 'questions' || e.type == 'choices')

      if (otherCheck[0].length == otherCheck[1].length) {
          sourke = prompt(`Enter Source File
                  A. Qbanks - Hussein Al-Hafeth
                  B. Qbank
                  C. Excel Questions
                  D. TBL`).toUpperCase()
          let sourkeObj = {
              A: "Qbanks - Hussein Al-Hafeth",
              B: "Qbank",
              C: "Excel Questions",
              D: "TBL"
          }

          let tempTag = prompt(`Write tag in the following Format:
                  Discipline Instructor Index LectureName
                  E.g.
                  Anatomy Dr Emad 1.1.1 Intro to Gross Anatomy`)
                  
          let discipline = tempTag.split(' ')?.[0]
          const n = tempTag.split("").findIndex(str => str !== " " && !isNaN(Number(str)));
          let instructor = tempTag.slice(0, -(tempTag.split("").length - n)).trim().split(" ").slice(1).join(" ")
          let index = tempTag.split(instructor + ' ')?.[1]?.split?.(' ')?.[0]
          let lecture = tempTag.split(index + ' ')?.[1]

          for (let i = 0; i < otherCheck[0].length; i++) {
              let qTxt = questions[i].innerText
              // let qParentNext = questions[i].parentElement.nextElementSibling
              // let attachment = qParentNext.querySelector('img') && !qParentNext.querySelector('[aria-level]') ? [qParentNext.querySelector('img').src] : []
              let qChoices = choices[i].innerText.split('\n\n')
              let qCorrect = choices[i].querySelector('[role="mark"]').parentElement.innerText

              output.push({
                  source: sourkeObj[sourke], //don't forget to edit value
                  batches: [],
                  type: "MCQ",
                  text: qTxt,
                  choices: qChoices,
                  correct_choice: qCorrect,
                  original_question: "",
                  original_answer: "",
                  discipline: discipline,
                  instructor: instructor,
                  matching_index: "", //manual
                  lecture: lecture,
                  index: index,
                  feedback_text: "", //manual for other options (maybe TBL will be automated later im lazy to work )
                  feedback_images: [], //Will work Always inshallah (scroll down) //manual for other options (maybe TBL will be automated later im lazy to work )
                  attachments: [], //Will work Always inshallah (scroll down) //commented out because other files are not consisted in img format, and trying to write algorithm for this shit is soo trash// attachment, //img, //DONT FORGET
                  week: index?.split('.')[0]
              })
          }
          //this part add Attachment and Feedback Images links to the questions 
          let globalArr = [...canvas.querySelector('[role="textbox"]').querySelectorAll('*')]
          let images = [...canvas.querySelectorAll('img')]
          
          images.forEach(image => {
              let revArr = globalArr.slice(0, globalArr.indexOf(globalArr.filter(e => e == image)[0])).reverse()
              let target = revArr.find(e => e.hasAttribute('aria-level'))
          
              if (target.getAttribute('aria-level') == 1) {
                  output.forEach(e => {if (e.text == target.innerText) {e.attachments.push(image.src)}})
              } else if (target.getAttribute('aria-level') == 2) {
                  let targetQ = globalArr.slice(0, globalArr.indexOf(globalArr.filter(e => e == target.closest('ol'))[0])).reverse().find(e => e.hasAttribute('aria-level')).innerText
                  output.forEach(e => {if (e.text == targetQ) {e.feedback_images.push(image.src)}})
              }
          })
      }
      if (canvas.querySelector('img')) canvas.querySelectorAll('img').forEach(e => console.log(e.src))
  } else if (lengthCheck.every(e => e == Math.max(...lengthCheck))) {
      sourke = 'Previous'
      for (let i = 0; i < lengthCheck[0]; i++) {
          let qTxt = questions[i].innerText
          let qParentNext = questions[i].parentElement.nextElementSibling
          let attachment = qParentNext.querySelector('img') && !qParentNext.querySelector('[aria-level]') ? [qParentNext.querySelector('img').src] : []
          let qChoices = choices[i].innerText.split('\n\n')
          let qCorrect = choices[i].querySelector('[role="mark"]').parentElement.innerText
          let qOgQ = ogQ[i]
          let qOgA = ogA[i]
          let tempTag = tags[i]
          let qBatches = batches[i]
          
          let discipline = tempTag.split(' ')?.[0]
          const n = tempTag.split("").findIndex(str => str !== " " && !isNaN(Number(str)));
          let instructor = tempTag.slice(0, -(tempTag.split("").length - n)).trim().split(" ").slice(1).join(" ")
          let index = tempTag.split(instructor + ' ')?.[1]?.split?.(' ')?.[0]
          let lecture = tempTag.split(index + ' ')?.[1]

          let fdImg = []
          let fdTxt = ""
          if (feedbacks[i].innerText.replace('Feedback:', '')) fdTxt = feedbacks[i].innerText.replace('Feedback:', '')
          if (feedbacks[i].querySelector('img')) feedbacks[i].querySelectorAll('img').forEach(e => fdImg.push(e.src))
          
          let feedLoop = feedbacks[i].nextElementSibling
          while (!feedLoop.querySelector('[aria-level]')) {
              if (feedLoop.querySelector('img')) {
                  feedLoop.querySelectorAll('img').forEach(e => fdImg.push(e.src))
              }
          
              if (feedLoop.innerText) {
                  fdTxt += feedLoop.innerText
              }

              if (feedLoop.nextElementSibling == undefined) break
              feedLoop = feedLoop.nextElementSibling
          }
          

          output.push({
              source: sourke, //don't forget to edit value
              batches: qBatches,
              type: "MCQ",
              text: qTxt,
              choices: qChoices,
              correct_choice: qCorrect,
              original_question: qOgQ,
              original_answer: qOgA,
              discipline: discipline,
              instructor: instructor,
              matching_index: "", //manual
              lecture: lecture,
              index: index,
              feedback_text: fdTxt, //DONT FORGET
              feedback_images: fdImg, //DONT FORGET
              attachments: attachment, //img, //DONT FORGET
              week: index?.split('.')[0]
          })
      }
  } else {
      console.log('Please edit the document for better result\nCtrl+F the missing part (add space or remove : check anything or even s')
      console.log(parentCheck)
  }

  console.log(stringy(output))

  chrome.runtime.sendMessage({
    action: "processData",
    data: stringy(output)
  });
})();
