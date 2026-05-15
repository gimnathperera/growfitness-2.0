export type Faq = { q: string; a: string };
export type FaqSection = { title: string; faqs: Faq[] };

export const faqSections: FaqSection[] = [
    {
        title: "General",
        faqs: [
            {
                q: "What is Grow Fitness?",
                a: "A children's fitness program for kids aged 4 and above in Colombo. We build real physical skills — movement, coordination, strength, and confidence — through group sessions, personal training, and preschool partnerships. Kids today spend more time on screens and less time moving. We help them rediscover the fun of movement, and for most, that shift alone changes everything.",
            },
            {
                q: "What ages do you work with?",
                a: "4 and above. Sessions are designed per developmental stage — a 4-year-old and a 10-year-old are never doing the same thing.",
            },
            {
                q: "Where are sessions held?",
                a: "Multiple locations across Colombo. Message us to find what's closest to you.",
            },
            {
                q: "Is my child safe?",
                a: "Our coaches are ex-professional or ex-schoolboy athletes, and every one of them goes through Grow Fitness's own training program before working with a child. Many also hold external diplomas, degrees, and certifications. We use the LTAD framework, a globally recognised method for age-appropriate development. Your child gets more than a safe environment — they get a world-class system.",
            },
            {
                q: "How do I know this actually works?",
                a: "Over 90% of kids show clearly visible signs of physical development within 8 weeks. Not self-reported. Visible.",
            },
            {
                q: "Do you train kids with special needs?",
                a: "Yes. Reach out to us directly and we'll take it from there.",
            },
            {
                q: "How long is each session?",
                a: "1 hour — for both group and personal training.",
            },
        ],
    },
    {
        title: "Group Sessions",
        faqs: [
            {
                q: "What does a session look like?",
                a: "Warm-up → skill blocks → cooldown. Every session has a focus — agility, speed, strength, balance, or coordination. Structured, coached, and actually fun.",
            },
            {
                q: "How many kids per coach?",
                a: "Maximum 6. Every child gets attention.",
            },
            {
                q: "How many coaches are in a group session?",
                a: "Each session has 4–5 coaches on the floor.",
            },
            {
                q: "Is there a trial session?",
                a: "Yes. Come and try a session first. If you'd like to continue, you sign up and pay for the full month, including the trial session.",
            },
            {
                q: "My child has never done this before. Will they manage?",
                a: "Yes. Activities scale to ability. Beginners and advanced kids work side by side without anyone feeling left out or held back.",
            },
            {
                q: "What if my child stops enjoying it?",
                a: "That's the last thing we want, and honestly, it's rare. If it happens, talk to us. We'll look at what's not clicking — session type, timing, or something else. Most of the time, a small change makes a big difference.",
            },
            {
                q: "What do they need to bring?",
                a: "Sports clothes, trainers, and a water bottle.",
            },
        ],
    },
    {
        title: "Personal Training",
        faqs: [
            {
                q: "What's the difference between PT and group?",
                a: "PT is tailored — built around your child's specific needs: strength, coordination, sport prep, or a movement challenge. Tracked and reported to you regularly.",
            },
            {
                q: "Is there a trial session?",
                a: "Yes. The first PT session is free. No commitment required — just be there.",
            },
            {
                q: "Will my child have the same coach every session?",
                a: "We do our best to keep things consistent. Occasionally coaches change, but every Grow Fitness coach is trained the same way and is great with kids, so your child is in good hands either way.",
            },
            {
                q: "How do you track progress?",
                a: "We assess across key movement and fitness markers. You'll receive progress reports and always know how your child is developing.",
            },
            {
                q: "How often should we come?",
                a: "We'll tell you after the first session. Depends on the goal.",
            },
            {
                q: "My child isn't sporty at all. Is this still for them?",
                a: "Especially for them. The goal isn't to build athletes — it's to give every child a body they feel comfortable in and know how to use.",
            },
        ],
    },
    {
        title: "Preschool Partnerships",
        faqs: [
            {
                q: "How does it work?",
                a: "We visit on a fixed schedule, plan everything, and run the sessions. You get a professional program. Your kids get purposeful movement.",
            },
            {
                q: "What's the basis of your program?",
                a: "Long-Term Athlete Development (LTAD) — a globally recognised framework for age-appropriate physical development. We don't just run kids around.",
            },
            {
                q: "What ages do you work with in preschools?",
                a: "4 and above. Activities are calibrated for early childhood — nothing too intense, everything developmentally sound.",
            },
            {
                q: "What does it cost?",
                a: "Fixed monthly retainers based on session frequency and group size. Message us for a proposal.",
            },
            {
                q: "Can we see a session before committing?",
                a: "Yes. We'll run a demo. See it before you decide.",
            },
        ],
    },
];
