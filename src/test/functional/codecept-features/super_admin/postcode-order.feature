Feature: Postcodes order

  Background:
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court

    And I hover over nav element
    And I click the types tab
    And I will make sure County court type is selected
    And I click on save court type

    And I hover over nav element
    And I click the cases heard tab
    And I will make sure Money claims is selected
    And I click on update on cases heard

    And I hover over nav element
    And I click the postcodes tab


  Scenario: validate that postcodes should appear in alpha numeric order @special
    When I add new postcodes "E5,E6,E9,E8,E7"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"
    Then I can see the court postcodes appear in alpha numeric order
    And the court is cleaned up through the API
