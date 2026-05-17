export const BRAND_LOGOS = {
  "Midea": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvl2GSFigO4nNXMWW1qO_VZ1GZwjVl5alpsw&s",
  "TCL": "https://cdn.manilastandard.net/wp-content/uploads/2023/02/TCL.png",
  "Aux": "https://auxaircon.com.ph/images/aux_logo.png",
  "Samsung": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXFVQh2BQhYtWf9APXNliSnNTi7MBwV6yPFA&s",
  "Daikin": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwu8SCQH4joBnn0HXF5F_HQKBRb85KZ8ZkuA&s",
  "Carrier": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Logo_of_the_Carrier_Corporation.svg",
  "LG": "https://www.lg.com/content/dam/lge/common/logo/logo-lg-100-44.jpg",
  "American Home": "https://ansons.ph/wp-content/uploads/2024/05/aham.jpg",
  "Gree": "https://1000logos.net/wp-content/uploads/2018/08/Gree-Logo.png",
  "Generic": "https://via.placeholder.com/100x100?text=Brand"
};

export const getBrandLogo = (brandName) => {
  if (!brandName) return BRAND_LOGOS["Generic"];
  return BRAND_LOGOS[brandName] || BRAND_LOGOS["Generic"];
};
