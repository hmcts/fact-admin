@fact-admin-tab-general-super-admin
Feature: General Info

  Scenario: Cant leave the name blank
    When I log in as an admin
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When a court is created through the API
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over general nav element
    When I click the general tab
    Then I enter "" in the Name textbox
    And I click the general info save button
    Then The error summary displays for general info "A problem occurred when saving the general information."
    Then the court is cleaned up through the API

  Scenario: Editing general info with the court name already exist
    When I log in as an admin
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When a court is created through the API
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over general nav element
    When I click the general tab
    Then I enter "Amersham Law Courts" in the Name textbox
    And I click the general info save button
    Then The error summary displays for general info "All names must be unique. Please check that a user is currently not editing this court, and that a court does not already exists with name: Amersham Law Courts"
    Then the court is cleaned up through the API

  Scenario: Adding intro paragraph welsh and English
    When I log in as an admin
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When a service centre court is created through the API
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over general nav element
    When I click the general tab
    When I add an "intro paragraph test" in the rich editor field provided "#sc_intro_paragraph_ifr"
    When I add an "intro paragraph welsh test" in the rich editor field provided "#sc_intro_paragraph_cy_ifr"
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    Then the court is cleaned up through the API

  Scenario: Editing common platform checkbox
    When I log in as an admin
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When a court is created through the API
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over general nav element
    When I click the general tab
    Then I uncheck common platform checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    Then the court is cleaned up through the API
