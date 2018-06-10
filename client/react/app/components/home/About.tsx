import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import NavBar from '../navbar';
import md from '../../helpers/markdown';
import { isAuthenticated } from '../../helpers/auth';

const formatHTML = (content = '') => {
  return { __html: md(content) };
};

// TODO: convert to HTML (this was just pulled from Github markdown)
const content = `
# Inspiration

After reading Dr. David Burns' [*Feeling Good*](https://www.amazon.com/Feeling-Good-New-Mood-Therapy/dp/0380810336), I wanted to see if there was any correlation between my productivity and my mood. To do this, I designed a personal "Daily Scorecard" to compare against Dr. Burns' "Depression Checklist" (a.k.a. my "Daily Check-in"). My goal is to try to identify which daily habits result in lower levels of depression.

# FAQ

**What is my "Daily Scorecard"?**

<img src="/assets/scorecard-screenshot.png" class="screenshot-image" />

Your scorecard is a list of tasks you'd like to incorporate into your daily routine as much as possible. By default, these tasks include activities related to health, reading, creativity, meditation, and socializing.

The goal of the scorecard is to remind yourself on a daily basis which habits you aspire to form. For example, if one of my goals is to get in better shape and I'm marking my scorecard on a daily basis, I'm constantly reminded of the exercise options I have. If I'm really struggling to get moving, I could just do 20 push-ups at home, or I could go for a walk. Doing either of those is better than doing nothing, and is usually a great way to alleviate the self-loathing that often accompanies laziness in neurotics like myself.

For more unique goals, like learning a new language, you can customize the tasks on your scorecard. In this case, you could creating a category called "Learn Arabic," and then create tasks such as "Study vocabulary/grammar," "Write a blog post in Arabic," "Watch a movie in Arabic," etc. The purpose is to break larger goals down into smaller, day-to-day tasks, in order to make them less overwhelming and more achievable.

**How is productivity measured?**

Each task in your scorecard is given a specific score based on difficulty. By default, the scores are set based on my personal approximation of the difficulty of each activity. I prefer to score tasks using powers of two (i.e. 1, 2, 4, 8, 16), but feel free to use whatever paradigm you like.

Using the example above of learning Arabic, we could value tasks as such:
- Write a blog post in Arabic: **16 points**
  - This task requires the practical application of what you've learned, so it deserves the most credit.
- Study vocabulary/grammar: **8 points**
  - This is essential to learning a new language but can feel a bit like busywork, so it still gets a lot of points.
- Watch a movie in Arabic: **4 points**
  - Watching a movie is not particularly difficult, but it can be a fun and effective way to learn new words and phrases.

Please note that scores should be judged not only by physical difficulty, but by psychological difficulty as well. For example, going for a walk may not be all that physically strenuous, but if willing yourself to get out of bed is a struggle, give yourself extra points for it.

**How do I edit my scorecard tasks and scores?**

<img src="/assets/task-management-screenshot.png" class="screenshot-image" />

You can create, edit, and deactivate tasks in the *Tasks* link in the navigation bar (in the upper right-hand corner) after logging in. Deactivating a task will prevent it from showing up in future scorecards.

**What is the "Daily Check-in"?**

<img src="/assets/check-in-screenshot.png" class="screenshot-image" />

The Daily Check-in, also known as the *Depression Checklist*, was created by Dr. David Burns. It's meant to quickly assess:
- thoughts and feelings, such as sadness or discouragement
- activities and personal relationships, such as loneliness and loss of motivation
- physical symptoms, such as difficulty sleeping
- suicidal urges, such as self-harm

Scores reflect roughly the following levels of depression:
- 0 - 5: No depression
- 6 - 10: Normal but unhappy
- 11 - 25: Mild depression
- 26 - 50: Moderate depression
- 51 - 75: Severe depression
- 76 - 10: Extreme depression

If you're scoring in the severe-to-extreme level of depression, I would highly encourage reaching out for help.

# Upcoming Features
- Overall design improvements
- Make the app more mobile-friendly
- Allow users to access historical data more easily
- Build a mobile version of the app

If you have any feature requests, bug reports, or any general feedback, feel free to email me at [uprite.co@gmail.com](mailto:uprite.co@gmail.com).
`;

interface AboutState {
  isLoggedIn: boolean;
}

class About extends React.Component<RouteComponentProps<{}>, AboutState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = { isLoggedIn: false };
  }

  componentDidMount() {
    // TODO: checking for authentication here is not ideal
    return isAuthenticated()
      .then(isLoggedIn => this.setState({ isLoggedIn }))
      .catch(err => console.log('Error authenticating!', err));
  }

  render() {
    const { history } = this.props;
    const { isLoggedIn } = this.state;

    return (
      <div>
        {/* TODO: handle navbar states better */}
        <NavBar
          title='About'
          linkTo={isLoggedIn ? '/dashboard' : '/login'}
          history={isLoggedIn && history} />

        <div className='default-container'>
          <div className='md-content'
            dangerouslySetInnerHTML={formatHTML(content)}>
          </div>
        </div>
      </div>
    );
  }
}

export default About;
