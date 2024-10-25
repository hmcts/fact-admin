Feature: Postcodes @postcodessss

  Scenario: Adding and deleting valid postcodes
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
    When I add new postcodes "bd7 2qb,bd3,BD7"
    Then I click the add postcode button and wait for success
    Then A green message is displayed for the postcodes "Postcodes updated"
    When I will make sure to delete the existing postcodes
    Then A green message is displayed for the postcodes "Postcodes updated"
    Then the court is cleaned up through the API

  Scenario: Adding duplicate postcode
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
    When I add new postcodes "bd1"
    Then I click the add postcode button and wait for success
    When I add new postcodes "bd1"
    Then I click the add postcode button and wait for failure
    Then The error message display for the postcodes "One or more postcodes provided already exist (your changes have not been saved). If this is not the case please check that the court is not currently locked by another user: BD1"
    Then the court is cleaned up through the API

  Scenario: Validate that postcodes should appear in alpha numeric order
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
    When I add new postcodes "E5,E6,E9,E8,E7"
    Then I click the add postcode button and wait for success
    Then A green message is displayed for the postcodes "Postcodes updated"
    Then I can see the court postcodes appear in alpha numeric order
    And the court is cleaned up through the API

  Scenario: Adding invalid postcode
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
    When I add new postcodes "E1"
    Then I click the add postcode button and wait for success
    When I add new postcodes "bdx,123,bd1"
    Then I click the add postcode button and wait for failure
    Then The error message display for the postcodes "A problem has occurred (your changes have not been saved). The following postcodes are invalid: bdx,123"
    Then the court is cleaned up through the API

    #THIS IS COMMENTED IN PREVIOUS TESTS SO COMMENTING IT HERE AS WELL (steps need to be converted)
#  Scenario Outline: Moving postcodes from the source court to the destination court
#    When I will make sure to delete the existing postcodes
#    When I add new postcodes "bd10,bd2,bd4"
#    Then I click the add postcode button
#    Then A green message is displayed for the postcodes "Postcodes updated"
#    Then I will make sure to delete the existing postcodes for the court "<view_court_slug>"
#    Then I go back to the editing postcodes for source court "county-court-money-claims-centre-ccmcc"
#    When I choose the postcodes "BD4" and "BD2" to move them from the source court to the destination court
#    Then I choose the destination court as "<view_court_slug>"
#    Then I click the move button
#    Then A green message is displayed for the postcodes "Postcodes updated"
#
#    Examples:
#      | view_court_slug             |
#      | county-court-business-centre-ccbc |
