import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqData = [
  {
    question: "How accurate is the AI pose detection?",
    answer:
      "Our AI system uses advanced TensorFlow.js technology to provide real-time pose detection with up to 95% accuracy. The system analyzes 17 key body points to ensure precise feedback on your yoga postures.",
  },
  {
    question: "Can I practice yoga without a mentor?",
    answer:
      "Yes, you can practice independently using our AI pose detection feature. However, we recommend joining mentor-led sessions for personalized guidance and proper technique development, especially for beginners.",
  },
  {
    question: "How does the diet planning feature work?",
    answer:
      "Our AI-powered diet planning system creates personalized meal plans based on your goals, preferences, and dietary restrictions. It considers factors like your activity level, current weight, and nutritional needs to provide balanced meal suggestions.",
  },
  {
    question: "What equipment do I need to get started?",
    answer:
      "You'll need a device with a camera (computer/laptop/smartphone), a yoga mat, and comfortable clothing. Make sure you have enough space to move freely and good lighting for optimal pose detection.",
  },
  {
    question: "How often are the mentor sessions available?",
    answer:
      "Mentor sessions are available daily, with multiple time slots to accommodate different schedules. You can book sessions in advance through our platform and join live interactive sessions with experienced yoga instructors.",
  },
  {
    question: "Can I track my progress over time?",
    answer:
      "Yes, our platform provides detailed progress tracking, including pose accuracy improvements, session attendance, calorie tracking, and wellness goals achievement. You can view your progress through interactive charts and reports.",
  },
];

export default function FAQ() {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        color="text.primary"
        sx={{ mb: { xs: 4, sm: 8 }, textAlign: "center" }}
      >
        Frequently Asked Questions
      </Typography>
      <Box sx={{ maxWidth: 800, margin: "auto" }}>
        {faqData.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              "&:not(:last-child)": { mb: 2 },
              backgroundColor: "background.paper",
              borderRadius: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "& .MuiAccordionSummary-content": {
                  my: 2,
                },
              }}
            >
              <Typography variant="h6" component="h3">
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
