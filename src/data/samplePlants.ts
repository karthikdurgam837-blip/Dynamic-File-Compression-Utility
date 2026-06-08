import { PlantDetails } from "../types";

export const SAMPLE_PLANTS: PlantDetails[] = [
  {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    description: "An iconic tropical climber famous for its stunning perforated leaves (fenestrations). Native to the dense rain forests of southern Mexico and Central America, it is a statement piece that brings a bold, jungle-like aesthetic to any indoor space.",
    difficulty: "Easy",
    careStats: {
      sunlight: "Bright, indirect sunlight. Avoid direct midday sun, which will scorch its lush foliage.",
      sunlightLevel: 3,
      watering: "Water thoroughly when the top 2 inches of soil feel dry. Typically every 7 to 10 days.",
      wateringLevel: 3,
      soilType: "Chunky, aerated potting soil with plenty of perlite, orchid bark, and organic compost.",
      humidity: "Prefers elevated humidity levels (50-60%). Appreciates regular misting or a pebble tray.",
      humidityLevel: 4,
      temperature: "65°F - 85°F (18°C - 29°C). Keep away from dry air vents and outdoor winter drafts."
    },
    careInstructions: {
      wateringTips: "Always test the soil moisture depth with your finger. If the soil is clinging to your finger and moist, wait. When watering, saturate the soil evenly until water drains freely from the base of the pot, then empty the drainage saucer.",
      sunlightTips: "Position your Monstera near an East or West-facing window to receive gentle morning or evening sun. Regular rotation (quarter-turn every month) ensures balanced growth and symmetrical leaf size.",
      feedingTips: "Feed monthly during the active spring and summer growing seasons with a balanced, organic water-soluble houseplant fertilizer diluted to half strength. Pause feeding completely in winter.",
      pruningTips: "Wipe leaves with a damp cloth monthly to clear dust and maximize photosynthesis. Prune away yellowing, older bottom leaves at the stem joint using sterilized bypass hand pruners."
    },
    commonIssues: [
      {
        issue: "Yellowing Lower Leaves",
        symptom: "Foliage turns pale yellow and soft, starting from the base of the stalk.",
        solution: "This is usually caused by chronic overwatering. Let the container dry out completely before next watering, check that your pot has drainage holes, and reduce watering frequency."
      },
      {
        issue: "Brown Leaf Margins or Cracks",
        symptom: "Crispy, dark brown edges on older or newer foliage sheets.",
        solution: "This indicates low humidity or underwatering. Place a humidifier nearby, run a misting cycle, or move the plant away from radiator heating elements."
      },
      {
        issue: "Lack of Split Leaves (No Fenestrations)",
        symptom: "New foliage grows fully solid and small, with no perforated splits.",
        solution: "The plant is not getting enough light. Relocate your Monstera to a brighter spot near filtered windows to encourage mature perforated growth."
      }
    ],
    propagation: {
      method: "Stem cuttings with an active leaf node",
      steps: [
        "Locate an healthy mature vine featuring at least one leaf and an exposed brown aerial root node.",
        "Take a neat diagonal cut about 1 inch below the aerial root node using clean garden snips.",
        "Place the cutting into clean room-temperature water, ensuring the leaf node is fully submerged.",
        "Relocate the water jar to a warm, brightly lit area and change the water weekly to keep it fresh.",
        "Once roots reach 2-3 inches in length (usually 4-6 weeks), transplant into aerated potting soil mixture."
      ]
    }
  },
  {
    name: "Peace Lily",
    scientificName: "Spathiphyllum wallisii",
    description: "An elegant, shade-loving foliage plant prized for its glossy dark green leaves and brilliant white flower-like sails (spathes). Revered for its air-purifying qualities and dramatic communication when thirsty.",
    difficulty: "Easy",
    careStats: {
      sunlight: "Low to bright indirect light. Exceptionally resilient in dim offices or corners.",
      sunlightLevel: 2,
      watering: "Keep soil consistently moist but never soggy. Water when the top inch of soil starts to feel dry.",
      wateringLevel: 4,
      soilType: "Moisture-retentive, organic loam enriched with vermiculite and peat moss.",
      humidity: "Appreciates moderate to high humidity (50-70%). Mist frequently if leaves crisp.",
      humidityLevel: 4,
      temperature: "65°F - 80°F (18°C - 27°C). Very sensitive to cold temperatures or frosty windows."
    },
    careInstructions: {
      wateringTips: "Listen to the plant—it will gracefully droop its leaves when dry and perk up within hours of deep watering. Avoid fluoride-heavy tap water to prevent brown tips; use filtered or rainwater.",
      sunlightTips: "While it can survive low light, to encourage regular blooming of white spathes, relocate it to medium/bright indirect light. Avoid direct hot sun which bleaches and burns the tender leaves.",
      feedingTips: "Feed every 6 weeks during spring and summer with a balanced organic liquid fertilizer formulated for flowering houseplants at 1/4 strength.",
      pruningTips: "Clip off spent green or brown flower stalks at the base of the plant. Wipe individual leaves gently with a damp sponge to remove dust."
    },
    commonIssues: [
      {
        issue: "Severe Sudden Drooping",
        symptom: "Complete collapse of leafy stalks, looking completely lifeless.",
        solution: "The plant is severely dehydrated. Submerge the nursery pot in a bowl of tepid water for 15-20 minutes, letting it absorb moisture from the bottom (bottom watering). It will bounce back!"
      },
      {
        issue: "Brown and Crispy Leaf Tips",
        symptom: "Strictly brown, burnt-looking foliage tips spreading inward.",
        solution: "Often caused by chemicals (fluoride/chlorine) in tap water or extremely dry room air. Switch to distilled/filtered water and mist daily."
      }
    ],
    propagation: {
      method: "Root crown division",
      steps: [
        "Gently slide the peace lily out of its container and shake away loose soil from the root ball.",
        "Locate natural individual plant crowns (clusters of leaves with their own root systems).",
        "Use your hands or a sterile knife to tease and separate root bundles into smaller sections.",
        "Repot each divided plantlet into its own snug pot with clean, damp potting soil.",
        "Keep the soil moist and place in bright, warm indirect light until established in 3-4 weeks."
      ]
    }
  },
  {
    name: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    description: "An incredibly architectural and indestructible succulent featuring upright sword-like, variegated leaves. Renowned for its hardiness, drought tolerance, and night-time oxygen production, making it a perfect bedroom addition.",
    difficulty: "Easy",
    careStats: {
      sunlight: "Extremely adaptable. Thrives in full sun, partial shade, and very dark rooms.",
      sunlightLevel: 2,
      watering: "Very low. Allow the entire soil volume to dry out completely between waterings.",
      wateringLevel: 1,
      soilType: "Sandy, extremely porous cactus and succulent potting mix boosted with coarse sand.",
      humidity: "Prefers dry, low-humidity conditions. Exceptionally comfortable in standard dry home air.",
      humidityLevel: 1,
      temperature: "60°F - 90°F (15°C - 32°C). Do not expose to temperatures below 50°F (10°C)."
    },
    careInstructions: {
      wateringTips: "Overwatering is the only way to harm this plant. If in doubt, do not water! In winter, you may only need to water once every 4 to 6 weeks. Insert a wooden stick all the way to the bottom to verify dry soil.",
      sunlightTips: "Thrives in a window facing any direction. To keep yellow borders vibrant and encourage high speed growth, choose a south or west-exposed direct solar spot.",
      feedingTips: "Rarely needs fertilizer. Feed twice a year (once in spring, once in summer) with highly diluted succulent liquid food.",
      pruningTips: "Pruning is rarely needed. If a leaf breaks or rots, cut the base cleanly. Use dry microfiber cloths to wipe accumulated house dust."
    },
    commonIssues: [
      {
        issue: "Mushy, Drooping Leaf Bases",
        symptom: "Stalks rot near the soil line, turn brown-yellow, and fall over.",
        solution: "Root rot due to stagnant wet soil. Remove the plant, cut away brown mushy roots, let the root ball dry on a dry towel, and repot in fresh dry sandy soil."
      },
      {
        issue: "Wrinkled, Pitted Foliage",
        symptom: "The tough sword blades look puckered and slightly deflated.",
        solution: "Extreme dehydration. Give a thorough watering until water flows out of the drainage hole, and repeat once the container dries out."
      }
    ],
    propagation: {
      method: "Leaf cuttings or rhizome division",
      steps: [
        "Cut a healthy leaf into 3-4 inch horizontal segments using clean shears.",
        "Note which end was 'down'—submerging or planting upside down will fail (polarity).",
        "Let the cut pieces dry for 2 days to form a hard callus at the raw edge.",
        "Submerge bottom 1 inch of segments in a water container or plant in damp sand.",
        "Keep warm and illuminated. Shoots and roots will sprout from the cut callused base in 1-2 months."
      ]
    }
  },
  {
    name: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    description: "The crown jewel of statement houseplants, famous for its giant, violin-shaped dramatic leaves. Native to West African tropical jungles, it is beautifully sculptural but holds a reputation for dramatic outbursts when moved.",
    difficulty: "Expert",
    careStats: {
      sunlight: "Bright, consistent indirect light. Needs a dedicated, highly illuminated home site.",
      sunlightLevel: 4,
      watering: "Water thoroughly when the top 3 inches of soil dry. Sensitive to wet feet.",
      wateringLevel: 2,
      soilType: "Rich, fast-draining, soil mix containing bark chips and perlite with active drain holes.",
      humidity: "High humidity lover (50-60%). Benefits enormously from humidifiers.",
      humidityLevel: 4,
      temperature: "65°F - 75°F (18°C - 24°C). Keep fully safe from cold drafts or air condition blasts."
    },
    careInstructions: {
      wateringTips: "Consistency is your main weapon. Water on a balanced pattern, pouring slowly until water flows into the tray. Empty the tray instantly to protect dry roots from stagnant pooling.",
      sunlightTips: "Needs bright filtered light for 6-8 hours daily. Rotate your fiddle 90 degrees every single week, otherwise it will bend significantly toward light sources and grow lopsided.",
      feedingTips: "Feed monthly during spring/summer growing windows with a high-nitrogen liquid fertilizer. Avoid winter feeding completely.",
      pruningTips: "Wipe large leaves weekly for heavy dust screens. Shake the trunk slightly to simulate jungle wind and build structural strength. Pinch active tip growth in spring to branch."
    },
    commonIssues: [
      {
        issue: "Brown Leaf Spots & Dropping Leaves",
        symptom: "Large dark brown spots appearing across the middle or margins, leaves fall off.",
        solution: "Usually a drainage or root issue (either root rot from overwatering or severe dry pockets). Keep the feeding cycle regular, adjust moisture, and ensure drainage is free."
      },
      {
        issue: "Tiny Red/Brown Speckles on New Leaves",
        symptom: "Brand new emerging baby leaves look dusted with tiny reddish spots (edema).",
        solution: "Edema is due to irregular water intake when cells swell and burst. Establish a consistent, calendar-aligned deep watering schedule instead of chaotic sips."
      }
    ],
    propagation: {
      method: "Stem cutting or air layering",
      steps: [
        "Take a spring cutting of a healthy branch tip, featuring 2 leaves and an active node.",
        "Be careful of the sticky latex white sap—wear gloves during cutting.",
        "Place the cutting in a glass vase of clean filtered water, exposing leaves to bright light.",
        "Change the water twice a week to maintain clear sterile root growth conditions.",
        "Wait for a strong bundle of roots to grow (6-8 weeks) before potting into fresh soil mix."
      ]
    }
  }
];
