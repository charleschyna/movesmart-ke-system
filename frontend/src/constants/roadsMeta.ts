export type RoadStatus = 'free' | 'slow' | 'heavy';

export interface RoadGeometry {
  // Representative center point of the road
  center: { lat: number; lng: number };
  // Optional bounding box [minLng, minLat, maxLng, maxLat]
  bbox?: [number, number, number, number];
  // Optional polyline with representative sampling points along the road
  polyline?: { lat: number; lng: number }[];
}

// Geometry metadata for major roads per city.
// Note: These are approximate placeholders and should be refined with
// actual polylines or segment-specific coordinates for higher accuracy.
export const ROAD_GEOMETRY: Record<string, Record<string, RoadGeometry>> = {
  nairobi: {
    uhuru_highway: { 
      center: { lat: -1.2888, lng: 36.8234 },
      polyline: [
        { lat: -1.3012, lng: 36.8164 },
        { lat: -1.2952, lng: 36.8194 },
        { lat: -1.2890, lng: 36.8232 },
        { lat: -1.2832, lng: 36.8270 }
      ]
    },
    waiyaki_way: { 
      center: { lat: -1.2716, lng: 36.7894 },
      polyline: [
        { lat: -1.2680, lng: 36.7790 },
        { lat: -1.2705, lng: 36.7850 },
        { lat: -1.2740, lng: 36.7930 },
        { lat: -1.2815, lng: 36.8070 }
      ]
    },
    mombasa_road: { 
      center: { lat: -1.3232, lng: 36.8460 },
      polyline: [
        { lat: -1.3180, lng: 36.8365 },
        { lat: -1.3220, lng: 36.8450 },
        { lat: -1.3280, lng: 36.8570 },
        { lat: -1.3390, lng: 36.8770 }
      ]
    },
    thika_road: { 
      center: { lat: -1.2304, lng: 36.8827 },
      polyline: [
        { lat: -1.2590, lng: 36.8450 },
        { lat: -1.2450, lng: 36.8620 },
        { lat: -1.2330, lng: 36.8780 },
        { lat: -1.2180, lng: 36.9020 }
      ]
    },
    ngong_road: { 
      center: { lat: -1.3001, lng: 36.7823 },
      polyline: [
        { lat: -1.2980, lng: 36.7760 },
        { lat: -1.3000, lng: 36.7850 },
        { lat: -1.3055, lng: 36.7980 },
        { lat: -1.3110, lng: 36.8110 }
      ]
    },
    jogoo_road: { 
      center: { lat: -1.3005, lng: 36.8625 },
      polyline: [
        { lat: -1.2950, lng: 36.8570 },
        { lat: -1.3005, lng: 36.8625 },
        { lat: -1.3055, lng: 36.8680 }
      ]
    },
    langata_road: { 
      center: { lat: -1.3223, lng: 36.7629 },
      polyline: [
        { lat: -1.3170, lng: 36.7500 },
        { lat: -1.3223, lng: 36.7629 },
        { lat: -1.3310, lng: 36.7830 }
      ]
    },
    outer_ring_road: { 
      center: { lat: -1.2789, lng: 36.8999 },
      polyline: [
        { lat: -1.2630, lng: 36.8890 },
        { lat: -1.2789, lng: 36.8999 },
        { lat: -1.2950, lng: 36.9130 }
      ]
    },
    enterprise_road: { 
      center: { lat: -1.3094, lng: 36.8531 },
      polyline: [
        { lat: -1.3040, lng: 36.8470 },
        { lat: -1.3094, lng: 36.8531 },
        { lat: -1.3155, lng: 36.8600 }
      ]
    },
    kiambu_road: { 
      center: { lat: -1.2412, lng: 36.8334 },
      polyline: [
        { lat: -1.2650, lng: 36.8240 },
        { lat: -1.2412, lng: 36.8334 },
        { lat: -1.2190, lng: 36.8430 }
      ]
    },
    limuru_road: { 
      center: { lat: -1.2555, lng: 36.8036 },
      polyline: [
        { lat: -1.2650, lng: 36.8000 },
        { lat: -1.2555, lng: 36.8036 },
        { lat: -1.2440, lng: 36.8080 }
      ]
    },
    haile_selassie_avenue: { 
      center: { lat: -1.2873, lng: 36.8221 },
      polyline: [
        { lat: -1.2920, lng: 36.8145 },
        { lat: -1.2873, lng: 36.8221 },
        { lat: -1.2830, lng: 36.8295 }
      ]
    },
    ring_road_westlands: { 
      center: { lat: -1.2674, lng: 36.8028 },
      polyline: [
        { lat: -1.2720, lng: 36.7950 },
        { lat: -1.2674, lng: 36.8028 },
        { lat: -1.2635, lng: 36.8105 }
      ]
    },
    james_gichuru_road: { 
      center: { lat: -1.2877, lng: 36.7773 },
      polyline: [
        { lat: -1.2815, lng: 36.7705 },
        { lat: -1.2877, lng: 36.7773 },
        { lat: -1.2940, lng: 36.7840 }
      ]
    },
    muthaiga_road: { 
      center: { lat: -1.2570, lng: 36.8335 },
      polyline: [
        { lat: -1.2625, lng: 36.8280 },
        { lat: -1.2570, lng: 36.8335 },
        { lat: -1.2520, lng: 36.8390 }
      ]
    },
    kenyatta_avenue: { 
      center: { lat: -1.2843, lng: 36.8192 },
      polyline: [
        { lat: -1.2875, lng: 36.8120 },
        { lat: -1.2843, lng: 36.8192 },
        { lat: -1.2810, lng: 36.8264 }
      ]
    },
  },
  mombasa: {
    moi_avenue: { center: { lat: -4.0579, lng: 39.6626 }, polyline: [
      { lat: -4.0600, lng: 39.6600 }, { lat: -4.0579, lng: 39.6626 }, { lat: -4.0558, lng: 39.6650 }
    ] },
    digo_road: { center: { lat: -4.0608, lng: 39.6642 }, polyline: [
      { lat: -4.0630, lng: 39.6630 }, { lat: -4.0608, lng: 39.6642 }, { lat: -4.0585, lng: 39.6655 }
    ] },
    mama_ngina_drive: { center: { lat: -4.0632, lng: 39.6806 }, polyline: [
      { lat: -4.0650, lng: 39.6785 }, { lat: -4.0632, lng: 39.6806 }, { lat: -4.0615, lng: 39.6828 }
    ] },
    nyali_bridge: { center: { lat: -4.0340, lng: 39.6769 }, polyline: [
      { lat: -4.0390, lng: 39.6745 }, { lat: -4.0340, lng: 39.6769 }, { lat: -4.0290, lng: 39.6793 }
    ] },
    links_road: { center: { lat: -4.0210, lng: 39.6966 }, polyline: [
      { lat: -4.0240, lng: 39.6940 }, { lat: -4.0210, lng: 39.6966 }, { lat: -4.0185, lng: 39.6990 }
    ] },
    malindi_road: { center: { lat: -4.0007, lng: 39.7078 }, polyline: [
      { lat: -4.0050, lng: 39.7040 }, { lat: -4.0007, lng: 39.7078 }, { lat: -3.9960, lng: 39.7115 }
    ] },
    airport_road: { center: { lat: -4.0186, lng: 39.5968 }, polyline: [
      { lat: -4.0230, lng: 39.5950 }, { lat: -4.0186, lng: 39.5968 }, { lat: -4.0140, lng: 39.5985 }
    ] },
    makupa_causeway: { center: { lat: -4.0564, lng: 39.6509 }, polyline: [
      { lat: -4.0600, lng: 39.6490 }, { lat: -4.0564, lng: 39.6509 }, { lat: -4.0530, lng: 39.6525 }
    ] },
    kilindini_road: { center: { lat: -4.0659, lng: 39.6418 }, polyline: [
      { lat: -4.0700, lng: 39.6400 }, { lat: -4.0659, lng: 39.6418 }, { lat: -4.0620, lng: 39.6440 }
    ] },
    likoni_road: { center: { lat: -4.0850, lng: 39.6600 }, polyline: [
      { lat: -4.0890, lng: 39.6580 }, { lat: -4.0850, lng: 39.6600 }, { lat: -4.0810, lng: 39.6620 }
    ] },
    port_reitz_road: { center: { lat: -4.0280, lng: 39.5990 }, polyline: [
      { lat: -4.0320, lng: 39.5970 }, { lat: -4.0280, lng: 39.5990 }, { lat: -4.0240, lng: 39.6010 }
    ] },
    jomo_kenyatta_avenue: { center: { lat: -4.0536, lng: 39.6622 }, polyline: [
      { lat: -4.0560, lng: 39.6600 }, { lat: -4.0536, lng: 39.6622 }, { lat: -4.0510, lng: 39.6640 }
    ] },
  },
  kisumu: {
    kakamega_road: { center: { lat: -0.0892, lng: 34.7463 }, polyline: [
      { lat: -0.0800, lng: 34.7400 }, { lat: -0.0892, lng: 34.7463 }, { lat: -0.0980, lng: 34.7520 }
    ] },
    busia_road: { center: { lat: -0.0956, lng: 34.7307 }, polyline: [
      { lat: -0.0900, lng: 34.7260 }, { lat: -0.0956, lng: 34.7307 }, { lat: -0.1010, lng: 34.7350 }
    ] },
    kondele_bypass: { center: { lat: -0.0828, lng: 34.7626 }, polyline: [
      { lat: -0.0780, lng: 34.7580 }, { lat: -0.0828, lng: 34.7626 }, { lat: -0.0870, lng: 34.7670 }
    ] },
    oginga_odinga_street: { center: { lat: -0.1020, lng: 34.7541 }, polyline: [
      { lat: -0.0990, lng: 34.7500 }, { lat: -0.1020, lng: 34.7541 }, { lat: -0.1050, lng: 34.7580 }
    ] },
    jomo_kenyatta_highway: { center: { lat: -0.1038, lng: 34.7479 }, polyline: [
      { lat: -0.1000, lng: 34.7420 }, { lat: -0.1038, lng: 34.7479 }, { lat: -0.1080, lng: 34.7530 }
    ] },
    nairobi_road: { center: { lat: -0.1258, lng: 34.7430 }, polyline: [
      { lat: -0.1190, lng: 34.7380 }, { lat: -0.1258, lng: 34.7430 }, { lat: -0.1320, lng: 34.7480 }
    ] },
    ring_road: { center: { lat: -0.0869, lng: 34.7581 }, polyline: [
      { lat: -0.0830, lng: 34.7540 }, { lat: -0.0869, lng: 34.7581 }, { lat: -0.0910, lng: 34.7620 }
    ] },
    kisian_bus_stage_road: { center: { lat: -0.1085, lng: 34.6806 }, polyline: [
      { lat: -0.1040, lng: 34.6760 }, { lat: -0.1085, lng: 34.6806 }, { lat: -0.1130, lng: 34.6850 }
    ] },
  },
  nakuru: {
    kenyatta_avenue: { center: { lat: -0.2855, lng: 36.0666 }, polyline: [
      { lat: -0.2880, lng: 36.0630 }, { lat: -0.2855, lng: 36.0666 }, { lat: -0.2830, lng: 36.0700 }
    ] },
    nairobi_nakuru_highway: { center: { lat: -0.3583, lng: 36.1209 }, polyline: [
      { lat: -0.3700, lng: 36.1100 }, { lat: -0.3583, lng: 36.1209 }, { lat: -0.3460, lng: 36.1320 }
    ] },
    eldoret_road: { center: { lat: -0.2721, lng: 36.0668 }, polyline: [
      { lat: -0.2800, lng: 36.0600 }, { lat: -0.2721, lng: 36.0668 }, { lat: -0.2650, lng: 36.0730 }
    ] },
    nyahururu_road: { center: { lat: -0.2858, lng: 36.0729 }, polyline: [
      { lat: -0.2920, lng: 36.0680 }, { lat: -0.2858, lng: 36.0729 }, { lat: -0.2800, lng: 36.0780 }
    ] },
    gilgil_road: { center: { lat: -0.4996, lng: 36.3224 }, polyline: [
      { lat: -0.5100, lng: 36.3150 }, { lat: -0.4996, lng: 36.3224 }, { lat: -0.4900, lng: 36.3290 }
    ] },
    london_road: { center: { lat: -0.2995, lng: 36.0462 }, polyline: [
      { lat: -0.3040, lng: 36.0420 }, { lat: -0.2995, lng: 36.0462 }, { lat: -0.2950, lng: 36.0505 }
    ] },
    nakuru_eldoret_highway: { center: { lat: -0.2502, lng: 36.0530 }, polyline: [
      { lat: -0.2600, lng: 36.0470 }, { lat: -0.2502, lng: 36.0530 }, { lat: -0.2400, lng: 36.0590 }
    ] },
    njoro_road: { center: { lat: -0.2981, lng: 36.0499 }, polyline: [
      { lat: -0.3030, lng: 36.0460 }, { lat: -0.2981, lng: 36.0499 }, { lat: -0.2930, lng: 36.0540 }
    ] },
  },
  eldoret: {
    uganda_road: { center: { lat: 0.5228, lng: 35.2736 }, polyline: [
      { lat: 0.5180, lng: 35.2710 }, { lat: 0.5228, lng: 35.2736 }, { lat: 0.5270, lng: 35.2760 }
    ] },
    nakuru_eldoret_highway: { center: { lat: 0.5395, lng: 35.2820 }, polyline: [
      { lat: 0.5320, lng: 35.2760 }, { lat: 0.5395, lng: 35.2820 }, { lat: 0.5460, lng: 35.2880 }
    ] },
    kapsabet_road: { center: { lat: 0.4962, lng: 35.2753 }, polyline: [
      { lat: 0.4900, lng: 35.2710 }, { lat: 0.4962, lng: 35.2753 }, { lat: 0.5020, lng: 35.2790 }
    ] },
    kitale_road: { center: { lat: 0.5368, lng: 35.2823 }, polyline: [
      { lat: 0.5300, lng: 35.2790 }, { lat: 0.5368, lng: 35.2823 }, { lat: 0.5430, lng: 35.2855 }
    ] },
    iten_road: { center: { lat: 0.5400, lng: 35.2906 }, polyline: [
      { lat: 0.5350, lng: 35.2870 }, { lat: 0.5400, lng: 35.2906 }, { lat: 0.5450, lng: 35.2940 }
    ] },
    west_road: { center: { lat: 0.5274, lng: 35.2626 }, polyline: [
      { lat: 0.5230, lng: 35.2590 }, { lat: 0.5274, lng: 35.2626 }, { lat: 0.5315, lng: 35.2658 }
    ] },
    kisumu_road: { center: { lat: 0.4786, lng: 35.2885 }, polyline: [
      { lat: 0.4720, lng: 35.2840 }, { lat: 0.4786, lng: 35.2885 }, { lat: 0.4850, lng: 35.2930 }
    ] },
    ziwa_road: { center: { lat: 0.6386, lng: 35.2702 }, polyline: [
      { lat: 0.6320, lng: 35.2660 }, { lat: 0.6386, lng: 35.2702 }, { lat: 0.6450, lng: 35.2740 }
    ] },
  },
  kiambu: {
    kiambu_road: { center: { lat: -1.2202, lng: 36.8283 }, polyline: [
      { lat: -1.2350, lng: 36.8220 }, { lat: -1.2202, lng: 36.8283 }, { lat: -1.2050, lng: 36.8350 }
    ] },
    ruiru_kamiti_road: { center: { lat: -1.1741, lng: 36.9029 }, polyline: [
      { lat: -1.1800, lng: 36.8950 }, { lat: -1.1741, lng: 36.9029 }, { lat: -1.1680, lng: 36.9100 }
    ] },
    kiambu_ruiru_road: { center: { lat: -1.1706, lng: 36.8789 }, polyline: [
      { lat: -1.1780, lng: 36.8720 }, { lat: -1.1706, lng: 36.8789 }, { lat: -1.1630, lng: 36.8855 }
    ] },
    kirigiti_ndumberi_road: { center: { lat: -1.1457, lng: 36.8345 }, polyline: [
      { lat: -1.1500, lng: 36.8300 }, { lat: -1.1457, lng: 36.8345 }, { lat: -1.1410, lng: 36.8390 }
    ] },
    githunguri_road: { center: { lat: -1.0708, lng: 36.7699 }, polyline: [
      { lat: -1.0780, lng: 36.7630 }, { lat: -1.0708, lng: 36.7699 }, { lat: -1.0640, lng: 36.7760 }
    ] },
    kiambu_githunguri_road: { center: { lat: -1.1181, lng: 36.8058 }, polyline: [
      { lat: -1.1250, lng: 36.8000 }, { lat: -1.1181, lng: 36.8058 }, { lat: -1.1110, lng: 36.8120 }
    ] },
    kabete_road: { center: { lat: -1.2606, lng: 36.7321 }, polyline: [
      { lat: -1.2680, lng: 36.7280 }, { lat: -1.2606, lng: 36.7321 }, { lat: -1.2530, lng: 36.7365 }
    ] },
    banana_ruiru_road: { center: { lat: -1.1688, lng: 36.7818 }, polyline: [
      { lat: -1.1750, lng: 36.7760 }, { lat: -1.1688, lng: 36.7818 }, { lat: -1.1620, lng: 36.7870 }
    ] },
    limuru_road: { center: { lat: -1.1532, lng: 36.7656 }, polyline: [
      { lat: -1.1600, lng: 36.7600 }, { lat: -1.1532, lng: 36.7656 }, { lat: -1.1460, lng: 36.7710 }
    ] },
    kamiti_road: { center: { lat: -1.1964, lng: 36.8807 }, polyline: [
      { lat: -1.2020, lng: 36.8750 }, { lat: -1.1964, lng: 36.8807 }, { lat: -1.1905, lng: 36.8860 }
    ] },
  },
};

